function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

function get_empty_tablero() {
    return [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],

        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],

        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
}

let tablero = null;
/*
function log_tablero_for_nodejs() {
    console.log(" +-------+-------+-------+");
    for (let y = 0; y <9; y++){
        for (let x = 0; x <9; x++){
            if (x%3 == 0){
                process.stdout.write(" |");
            }
            let number = tablero[y][x];
            if (number == 0){
                number = ".";
            } else{
                number = number.toString();
            }
            
            process.stdout.write(" "+number);
        }
        console.log(" |");
        if (y%3 == 2){
            console.log(" +-------+-------+-------+");
        }
        
    }

}
*/

function log_tablero() {
    console.log(tablero);
}

function check_lines(y, number) {
    for (let i = 0; i < 9; i++) {
        if (tablero[y][i] == number) {
            return true;
        }
    }

    return false;
}

function check_columns(x, number) {
    for (let i = 0; i < 9; i++) {
        if (tablero[i][x] == number) {
            return true;
        }
    }
    return false;
}

function check_grids(x, y, number) {
    const start_y = ((y / 3) | 0) * 3;
    const start_x = ((x / 3) | 0) * 3;

    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            if (tablero[start_y + y][start_x + x] == number) {
                return true;
            }
        }
    }

    return false;
}

function check_casilla(x, y) {
    let posible_numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    posible_numbers.forEach((number) => {
        if (
            check_lines(y, number) ||
            check_columns(x, number) ||
            check_grids(x, y, number)
        ) {
            posible_numbers[number - 1] = 0;
        }
    });

    return posible_numbers.filter((number) => number != 0);
}

function tablero_is_finished() {
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (tablero[y][x] == 0) {
                return false;
            }
        }
    }

    return true;
}

function html_board_is_full() {
    let board_full = true;
    update_all_tiles((id) => {
        let tile = document.getElementById(id);
        if (tile.textContent == "") {
            board_full = false;
            return;
        }
    });

    return board_full;
}

function solve_random() {
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (tablero[y][x] != 0) {
                continue;
            }

            for (const number of shuffle(check_casilla(x, y))) {
                tablero[y][x] = number;
                if (solve_random()) {
                    return true;
                }
            }

            tablero[y][x] = 0;
            return false;
        }
    }

    return true;
}

function solve() {
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (tablero[y][x] != 0) {
                continue;
            }

            for (const number of check_casilla(x, y)) {
                tablero[y][x] = number;
                if (solve()) {
                    return true;
                }
            }

            tablero[y][x] = 0;
            return false;
        }
    }

    return true;
}

let solutions = 0;
function get_solutions() {
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (tablero[y][x] != 0) {
                continue;
            }

            for (const number of check_casilla(x, y)) {
                tablero[y][x] = number;

                if (get_solutions()) {
                    solutions += 1;
                    if (solutions >= 2) {
                        tablero[y][x] = 0;
                        return false;
                    }
                }
            }

            tablero[y][x] = 0;
            return false;
        }
    }

    return true;
}

function solution_is_unique() {
    solutions = 0;
    get_solutions();
    if (solutions == 1) {
        return true;
    }
    return false;
}

function generate_new_sudoku() {
    tablero = get_empty_tablero();
    solve_random();

    let blanck_space = 0;

    for (i of shuffle([...Array(81).keys()])) {
        
        if (erase_casilla(i)) {
            blanck_space++;
            //ESTO NO FUNCIONA IGUAL POR EL ASYNC
        }
        if (blanck_space > 50) {
            break;
        }
    }
}

//MAGIA???
async function erase_casilla(i) {
    let x = i % 9;
    let y = (i / 9) | 0;
    
    let old_number = tablero[y][x];
    tablero[y][x] = 0;
    if (!solution_is_unique()) {
        tablero[y][x] = old_number;
        return false;
    }

    return true;
}

function ver_solucion() {
    update_all_tiles(update_solution);
}

function nuevo_juego() {
    generate_new_sudoku();
    console.log(solution_is_unique());

    update_all_tiles(update_tile);
    solve();
}

let errores = 0;
function ver_errores() {
    errores = 0;
    update_all_tiles(update_tile_check_error);
    if (html_board_is_full() && errores == 0) {
        alert("¡Sudoku completado!");
    }
}


let pencil = false;
function change_pencil(){
    event.stopPropagation();
    pencil = !pencil;
    
    let pencil_button = document.getElementById("pencil")
    if (pencil_button.classList.contains("active")){
        pencil_button.classList.remove("active")
    }else{
        pencil_button.classList.add("active")
    }
    
    
    console.log(pencil);
}


function select_number(number) {
    if (selected == null || !selected.classList.contains("new")) {
        return;
    }
    
    if (pencil) {
        event.stopPropagation();
    }
    
    if (number == 0) {
        number = "";
    }else if (pencil){
        if (!selected.classList.contains("pencil")){ selected.textContent = ""}
        selected.classList.add("pencil")
        
        let numbers = (selected.textContent + number).replaceAll(",", "")
        selected.textContent = numbers.slice(Math.max(numbers.length - 3, 0)).split("")
        return
    }
    
    selected.textContent = number;
    selected.classList.remove("error");
    selected.classList.remove("pencil");

    
}





function update_tile_check_error(id) {
    let tile = document.getElementById(id);
    let x = id % 9;
    let y = (id / 9) | 0;

    if (tile.textContent != "") {
        if (parseInt(tile.textContent) != tablero[y][x]) {
            errores++;
            tile.classList.add("error");
        }
    }
}

function update_solution(id) {
    let tile = document.getElementById(id);
    let x = id % 9;
    let y = (id / 9) | 0;
    tile.classList.remove("error");
    tile.classList.remove("pencil");
    tile.textContent = tablero[y][x];
}

function update_tile(id) {
    let tile = document.getElementById(id);
    let x = id % 9;
    let y = (id / 9) | 0;
    let content = tablero[y][x];

    tile.classList.remove("new");
    tile.classList.remove("error");
    tile.classList.remove("pencil");
    if (content == 0) {
        content = "";
        tile.classList.add("new");
    }
    tile.textContent = content;
}


function update_all_tiles(func) {
    for (let i = 0; i < 81; i++) {
        func(i);
    }
}












let selected = null;
function generate_tablero_html() {
    
    
    board = document.getElementById("board");
    for (let i = 0; i < 81; i++) {
        let tile = document.createElement("p");

        tile.classList.add("tile");
        tile.id = i;
        if (i % 3 == 0 && i % 9 != 0) {
            tile.classList.add("left_border");
        }

        if (i > 9 && (((i % 27) / 9) | 0) == 0) {
            tile.classList.add("top_border");
        }

        tile.addEventListener("click", () => {
            event.stopPropagation();
            
            if (selected != null) {
                selected.classList.remove("selected");
                if (selected.id == tile.id) {
                    selected = null;
                } else {
                    tile.classList.add("selected");
                    selected = tile;
                }
            } else {
                tile.classList.add("selected");
                selected = tile;
            }
        });

        board.appendChild(tile);
    }

    console.log(board);
    
    
    
    document.addEventListener("click", () => {
        
        if (selected != null) {
            selected.classList.remove("selected");
            selected = null;
        }
    });

}








generate_tablero_html();





generate_new_sudoku();
update_all_tiles(update_tile);
solve();
