module TcTurtleRenderer exposing (render)

import Svg exposing (Svg, svg, line)
import Svg.Attributes exposing (x1, y1, x2, y2, stroke, strokeWidth)
import TcTurtle exposing (Instruction(..), Program)
import List exposing (foldl)
import Basics exposing (degrees, cos, sin)

type alias Position = { x : Float, y : Float }
type alias State = { position : Position, angle : Float, lines : List (Svg msg) }

initialState : State
initialState =
    { position = { x = 250, y = 250 } -- Centre du dessin
    , angle = 0
    , lines = []
    }

moveForward : Int -> State -> State
moveForward distance state =
    let
        rad = degrees state.angle
        dx = toFloat distance * cos rad
        dy = toFloat distance * sin rad
        newPos = { x = state.position.x + dx, y = state.position.y + dy }
        newLine =
            line
                [ x1 (String.fromFloat state.position.x)
                , y1 (String.fromFloat state.position.y)
                , x2 (String.fromFloat newPos.x)
                , y2 (String.fromFloat newPos.y)
                , stroke "black"
                , strokeWidth "2"
                ]
                []
    in
    { state | position = newPos, lines = state.lines ++ [ newLine ] }

turnLeft : Int -> State -> State
turnLeft degrees state =
    { state | angle = state.angle - toFloat degrees }

turnRight : Int -> State -> State
turnRight degrees state =
    { state | angle = state.angle + toFloat degrees }

interpret : Program -> State -> State
interpret program state =
    foldl
        (\instr st ->
            case instr of
                Forward d -> moveForward d st
                Left d -> turnLeft d st
                Right d -> turnRight d st
                Repeat n subprog ->
                    List.foldl (\_ s -> interpret subprog s) st (List.range 1 n)
        )
        state
        program

render : Program -> Svg msg
render program =
    let
        finalState = interpret program initialState
    in
    svg [ Svg.Attributes.width "500", Svg.Attributes.height "500" ] finalState.lines
