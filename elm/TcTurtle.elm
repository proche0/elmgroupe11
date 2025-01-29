module TcTurtle exposing (Instruction(..), Program)

type Instruction
    = Forward Int
    | Left Int
    | Right Int
    | Repeat Int (List Instruction)
    | Color String
    | Width String
type alias Program = List Instruction