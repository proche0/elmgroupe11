module ParserTcTurtle exposing (parseProgram)

import Parser exposing (..)
import TcTurtle exposing (Instruction(..), Program)

instructionParser : Parser Instruction
instructionParser =
    oneOf
        [ map Forward (token "Forward" |> spaces |> ignoreThen int)
        , map Left (token "Left" |> spaces |> ignoreThen int)
        , map Right (token "Right" |> spaces |> ignoreThen int)
        , lazy (\_ -> repeatParser)
        ]

repeatParser : Parser Instruction
repeatParser =
    succeed Repeat
        |= (token "Repeat" |> spaces |> ignoreThen int)
        |= (spaces |> ignoreThen (sequence '[' ']' (instructionParser |> spaces |> separatedBy (token "," |> spaces))))

programParser : Parser Program
programParser =
    sequence '[' ']' (instructionParser |> spaces |> separatedBy (token "," |> spaces))

parseProgram : String -> Result (List DeadEnd) Program
parseProgram input =
    run programParser input
