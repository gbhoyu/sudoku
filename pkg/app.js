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
    }
});
document.getElementById("back_modal").addEventListener("click", e => {
    document.getElementById("modal").style.display = "none"
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
        let p = document.createElement("pre")
        p.id = "^" + count
        p.textContent = "   \n   \n   "
        td.appendChild(p)

        count++;
    }
}


let board_easy = Board.easy()
let board_hard = Board.hard()

let board = board_easy
bind_board(board)

document.getElementById("blank").style.display = "none"



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

        let s = "   \n   \n   "
        let pre = document.getElementById("^" + i)

        for (let j = 0; j < 9; j++) {
            let index = j + Math.floor(j / 3)
            if (board.get_anotation(x, y, j)) {
                s = s.substring(0, index) + (j + 1) + s.substring(index + 1)
            }

        }
        pre.textContent = s

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
                if (!element || !element.classList.contains("editable")) { continue; }
                let x = i % 9
                let y = Math.floor(i / 9)
                element.textContent = board.get_value_solution(x, y);
                element.classList.add("static")
                element.classList.remove("editable")
                board.set_state(x, y, element.textContent, "static")
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

        let pre = document.getElementById("^" + selected_tile.id)
        if (number == " ") {
            pre.textContent = "   \n   \n   ";
            for (let j = 0; j < 9; j++) {
                board.set_anotation(x, y, j, false)
            }
            return
        }

        let s = pre.textContent
        let n = parseInt(number) - 1
        let index = n + Math.floor(n / 3)

        if (pre.textContent[index] == " ") {
            pre.textContent = s.substring(0, index) + number + s.substring(index + 1);
            board.set_anotation(x, y, number - 1, true)
        } else {
            pre.textContent = s.substring(0, index) + " " + s.substring(index + 1);
            board.set_anotation(x, y, number - 1, false)
        }
        board.set_state(x, y, 0, "normal")

    } else {
        let pre = document.getElementById("^" + selected_tile.id)
        pre.textContent = "   \n   \n   ";
        for (let j = 0; j < 9; j++) {
            board.set_anotation(x, y, j, false)
        }
        selected_tile.textContent = number
        board.set_state(x, y, number, "normal")
        if (board.is_finished()) {
            requestIdleCallback(() => {
                selected_tile.classList.remove("selected")
                selected_tile = null
                settings({ srcElement: document.getElementById("check_errors"), stopPropagation: () => { } })
                document.getElementById("modal").style.display = "block"
            })
        }

    }
    selected_tile.classList.remove("error")
    selected_tile.classList.remove("shake")
}

