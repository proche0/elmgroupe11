module Main exposing (main)

import Parser exposing (Parser, DeadEnd)
import Browser
import Html exposing (Html, div, input, button, text)
import Html.Attributes exposing (placeholder, value)
import Html.Events exposing (onClick, onInput)
import Svg exposing (Svg)
import ParserTcTurtle exposing (parseProgram)
import TcTurtle exposing (Program)
import TcTurtleRenderer exposing (render)

-- MODEL

type alias Model =
    { input : String
    , parsedProgram : Result (List Parser.DeadEnd) Program
    }

init : Model
init =
    { input = ""
    , parsedProgram = Err [] }

type Msg
    = UpdateInput String
    | RunProgram

update : Msg -> Model -> Model
update msg model =
    case msg of
        UpdateInput newInput ->
            { model | input = newInput }

        RunProgram ->
            { model | parsedProgram = parseProgram model.input }

view : Model -> Html Msg
view model =
    div []
        [ input
            [ placeholder "Entrez un programme TcTurtle"
            , value model.input
            , onInput UpdateInput
            ]
            []
        , button [ onClick RunProgram ] [ text "Exécuter" ]
        , case model.parsedProgram of
            Ok program -> render program
            Err _ -> text "Erreur de parsing ! Vérifiez votre syntaxe."
        ]

main =
    Browser.sandbox { init = init, update = update, view = view }
