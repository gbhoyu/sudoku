import init, { Board } from "./sudoku.js"
await init()



let board_table = document.getElementById("board_table")
let selected_tile = null
let selected_mode = document.getElementById("easy_mode")
selected_mode.className = "selected_mode"


document.getElementById("easy_mode").addEventListener("click", select_mode)
document.getElementById("hard_mode").addEventListener("click", select_mode)
document.addEventListener("click", e => {
    if (document.getElementById("settings").firstElementChild.style.display != "") {
        document.getElementById("settings").firstElementChild.style.display = ""
        arrow.classList.add("arrow-down")
        arrow.classList.remove("arrow-up")
    }
});
document.getElementById("back_modal").addEventListener("click", e => {
    document.getElementById("modal").style.display = "none"
})
document.getElementById("play_again_modal").addEventListener("click", e => {
    document.getElementById("modal").style.display = "none"
    settings({ srcElement: document.getElementById("new_puzzle"), stopPropagation: () => { } })
})
document.getElementById("settings").addEventListener("click", settings)
document.getElementById("pencil").addEventListener("click", toggle_pencil)




let count = 0
for (const tr of board_table.firstElementChild.children) {

    for (const td of tr.children) {
        let button = td.firstElementChild
        button.addEventListener("click", select_tile)
        button.id = count.toString()
        button.className = "tile"

        let a = document.createElement("div")
        a.className = "anotations"
        a.id = "^" + count

        requestIdleCallback(() => {

            for (let i = 0; i < 9; i++) {
                let num = document.createElement("div")
                num.textContent = ""
                a.append(num)
            }

        })

        td.append(a)

        count++;
    }
}


let board_easy = Board.easy()
let board_hard = Board.hard()

let board = board_easy
bind_board(board)
document.getElementById("loadOverlay").style.display = "none"



function bind_board(board) {

    for (let i = 0; i < 81; i++) {
        let x = i % 9
        let y = Math.floor(i / 9);
        let content = board.get_value(x, y)
        let state = board.get_state(x, y).split(" ")
        let type = state[0]
        let value = state[1]
        if (value == 0) {
            value = " "
        }
        let element = document.getElementById(i)
        if (content == " ") {
            if (type === "normal") {
                element.className = "tile editable"
            } else if (type === "static") {
                element.className = "tile static"
            } else if (type === "error") {
                element.className = "tile editable error"
            }
            element.textContent = value
        } else {
            element.textContent = content
            element.className = "tile"
        }


        let a = document.getElementById("^" + i)
        for (const child of a.children) {
            child.innerHTML = ""
        }

        for (let j = 0; j < 9; j++) {

            if (board.get_anotation(x, y, j)) {
                a.children[j].innerHTML = j + 1

            }

        }


    }
}


function select_tile(event) {
    let button = event.srcElement

    if (!selected_tile) {
        button.classList.add("selected")
        selected_tile = button
    } else {
        if (selected_tile.id != button.id) {
            button.classList.add("selected")
            selected_tile.classList.remove("selected")
            selected_tile = button
        } else {
            selected_tile.classList.remove("selected")
            selected_tile = null
        }

    }

}


function select_mode(event) {
    let button = event.srcElement
    selected_mode.className = ""
    button.className = "selected_mode"
    selected_mode = button
    selected_tile = null
    if (button.textContent == "Easy") {
        board = board_easy
        bind_board(board)
    } else {
        board = board_hard
        bind_board(board)
    }
}

function settings(event) {
    event.stopPropagation()
    let button = event.srcElement
    let list = document.getElementById("settings_list")
    let arrow = document.getElementById("arrow")

    switch (button.textContent) {
        case "New puzzle":
            document.getElementById("board_table").classList.add("blur")

            if (selected_mode.textContent == "Easy") {
                requestIdleCallback(() => {
                    board_easy = Board.easy()
                    bind_board(board_easy)
                    board = board_easy
                    document.getElementById("board_table").classList.remove("blur")

                })
            } else {
                requestIdleCallback(() => {
                    board_hard = Board.hard()
                    bind_board(board_hard)
                    board = board_hard
                    document.getElementById("board_table").classList.remove("blur")
                })

            }
            list.style.display = ""
            arrow.classList.add("arrow-down")
            arrow.classList.remove("arrow-up")
            break;
        case "Reveal puzzle":
            for (let i = 0; i < 81; i++) {
                let element = document.getElementById(i)
                if (!element || !element.classList.contains("editable") ||
                    element.classList.contains("static")) { continue; }
                let x = i % 9
                let y = Math.floor(i / 9)
                element.textContent = board.get_value_solution(x, y);
                element.classList.add("static")
                element.classList.remove("editable")
                board.set_state(x, y, element.textContent, "static")

                let a = document.getElementById("^" + i)
                for (const child of a.children) {
                    child.innerHTML = ""
                }
                for (let j = 0; j < 9; j++) {
                    board.set_anotation(x, y, j, false)
                }
            }
            list.style.display = ""
            arrow.classList.add("arrow-down")
            arrow.classList.remove("arrow-up")
            break;
        case "Check errors":
            for (let i = 0; i < 81; i++) {
                let element = document.getElementById(i)
                if (!element || !element.classList.contains("editable")) { continue; }
                let x = i % 9
                let y = Math.floor(i / 9)

                if (element.textContent != " ") {
                    if (element.textContent != board.get_value_solution(x, y)) {
                        if (board.get_state(x, y, element.textContent)[0] != "e") {
                            element.classList.add("shake")
                        }
                        element.classList.add("error")
                        board.set_state(x, y, element.textContent, "error")
                    } else {
                        element.classList.add("static")
                        element.classList.remove("editable")
                        board.set_state(x, y, element.textContent, "static")
                    }
                }
            }
            list.style.display = ""
            arrow.classList.add("arrow-down")
            arrow.classList.remove("arrow-up")
            break;
        default:
            if (list.style.display == "") {
                list.style.display = "flex"
                arrow.classList.remove("arrow-down")
                arrow.classList.add("arrow-up")
            } else {
                list.style.display = ""
                arrow.classList.add("arrow-down")
                arrow.classList.remove("arrow-up")

            }

    }



}

function toggle_pencil(event) {
    let button = event.srcElement
    if (button.classList.contains("selected")) {
        button.className = "pencil"
    } else {

        button.className = "pencil selected"
    }


}


window.put_number = function (number) {
    if (!selected_tile || !selected_tile.classList.contains("editable")) {
        return
    }
    let i = selected_tile.id
    let x = i % 9
    let y = Math.floor(i / 9)

    if (document.getElementById("pencil").classList.contains("selected")) {
        selected_tile.textContent = " "
        let a = document.getElementById("^" + selected_tile.id)

        if (number == " ") {
            for (const child of a.children) {
                child.innerHTML = ""
            }
            for (let j = 0; j < 9; j++) {
                board.set_anotation(x, y, j, false)
            }
            return
        }


        let child = a.children[number - 1]
        if (child.innerHTML == "") {
            child.innerHTML = number
            board.set_anotation(x, y, number - 1, true)
        } else {
            child.innerHTML = ""
            board.set_anotation(x, y, number - 1, false)
        }
        board.set_state(x, y, 0, "normal")
        selected_tile.classList.remove("error")
        selected_tile.classList.remove("shake")
    } else {
        let a = document.getElementById("^" + selected_tile.id)
        for (const child of a.children) {
            child.innerHTML = ""
        }
        for (let j = 0; j < 9; j++) {
            board.set_anotation(x, y, j, false)
        }

        selected_tile.textContent = number
        selected_tile.classList.remove("error")
        selected_tile.classList.remove("shake")
        
        board.set_state(x, y, number, "normal")
        
        if (board.is_finished()) {
            selected_tile.classList.remove("selected")
            selected_tile = null
            requestIdleCallback(() => {
                let audio = document.getElementById("victory_sound")
                audio.volume = 0.9
                audio.play();
                settings({ srcElement: document.getElementById("check_errors"), stopPropagation: () => { } })
                document.getElementById("modal").style.display = "flex"
            })
        }

    }
}




//----------------------------------------------------------------
