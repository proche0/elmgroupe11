module ParserTcTurtle exposing (parseProgram, repeatParser, programParser, instructionParser)

import Parser exposing (Parser, (|=), (|.), succeed, oneOf, map, lazy, token, spaces, int, andThen, spaces, sequence, run)
import TcTurtle exposing (Instruction(..), Program)

instructionParser : Parser Instruction
instructionParser =
    oneOf
    [ map Forward (token "Forward" |. spaces |> andThen (\_ -> int))
    , map Left (token "Left" |. spaces |> andThen (\_ -> int))
    , map Right (token "Right" |. spaces |> andThen (\_ -> int))
    , lazy (\_ -> repeatParser)
    ]

repeatParser : Parser Instruction
repeatParser =
    succeed Repeat
        |= (token "Repeat" |. spaces |> andThen (\_ -> int))
        |= (spaces |> Parser.andThen (\_ ->
            Parser.sequence
                { start = "["
                , end = "]"
                , separator = ","
                , spaces = spaces
                , trailing = Parser.Forbidden
                , item = instructionParser
                }
        ))

programParser : Parser Program
programParser =
    Parser.sequence
    { start = "["
    , end = "]"
    , separator = ","
    , spaces = spaces
    , trailing = Parser.Forbidden
    , item = instructionParser
    }

parseProgram : String -> Result (List Parser.DeadEnd) Program
parseProgram input =
    Parser.run programParser input
