use std::any::Any;

use rand::seq::SliceRandom;
use rand::thread_rng;
use rand::Rng;
use wasm_bindgen::prelude::*;

#[derive(Copy, Clone)]
enum Tile {
    Normal(u8),
    Static(u8),
    Error(u8),
}

impl Tile {
    pub fn name(&self) -> String {
        match self {
            Tile::Normal(val) => format!("normal {val}"),
            Tile::Static(val) => format!("static {val}"),
            Tile::Error(val) => format!("error {val}"),
            _ => String::from(""),
        }
    }
    pub fn get_value(&self) -> u8 {
        match self {
            Tile::Normal(val) => *val,
            Tile::Static(val) => *val,
            Tile::Error(val) => *val,
        }
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u8(a: u8);
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

#[wasm_bindgen]
struct Board {
    values: [[u8; 9]; 9],
    state: [[Tile; 9]; 9],
    solution: Option<[[u8; 9]; 9]>,
    anotations: [[[bool; 9]; 9]; 9],
}

#[wasm_bindgen]
impl Board {
    pub fn blank() -> Board {
        Board {
            values: [[0u8; 9]; 9],
            state: [[Tile::Normal(0); 9]; 9],
            solution: None,
            anotations: [[[false; 9]; 9]; 9],
        }
    }

    pub fn hard() -> Board {
        let mut board = Board::blank();
        board.solve_rng(0, 0);
        board.solution = Some(board.values.clone());

        for _ in 0..63 {
            let mut current_pos = None;
            let mut current_dificulty = 0;
            let positions = [
                board.erase_casilla(),
                board.erase_casilla(),
                board.erase_casilla(),
                board.erase_casilla(),
            ];
            for pos in positions {
                if let Some([x, y, dificulty]) = pos {
                    if current_dificulty < dificulty {
                        current_dificulty = dificulty;
                        current_pos = Some([x, y]);
                    }
                }
            }
            if let Some([x, y]) = current_pos {
                board.values[y][x] = 0;
            }
        }
        for _ in 0..20 {
            if let Some([x, y, _]) = board.erase_casilla() {
                board.values[y][x] = 0;
            }
        }

        board
    }

    pub fn easy() -> Board {
        let mut board = Board::blank();
        board.solve_rng(0, 0);
        board.solution = Some(board.values.clone());
        //50
        for _ in 0..50 {
            let mut current_pos = None;
            let mut current_dificulty = 10000;
            let positions = [
                board.erase_casilla(),
                board.erase_casilla(),
                board.erase_casilla(),
                board.erase_casilla(),
                board.erase_casilla(),
                board.erase_casilla(),
                board.erase_casilla(),
                board.erase_casilla(),
            ];
            for pos in positions {
                if let Some([x, y, dificulty]) = pos {
                    if current_dificulty > dificulty {
                        current_dificulty = dificulty;
                        current_pos = Some([x, y]);
                    }
                }
            }
            if let Some([x, y]) = current_pos {
                board.values[y][x] = 0;
            }
        }

        board
    }

    fn get_next_pos(x: usize, y: usize) -> (usize, usize) {
        if x < 8 {
            return (x + 1, y);
        }
        (0, y + 1)
    }

    fn check_line(&self, number: u8, y: usize) -> bool {
        for x in 0..9 {
            if self.values[y][x] == number {
                return false;
            }
        }
        true
    }

    fn check_column(&self, number: u8, x: usize) -> bool {
        for y in 0..9 {
            if self.values[y][x] == number {
                return false;
            }
        }
        true
    }

    fn check_grid(&self, number: u8, x: usize, y: usize) -> bool {
        let x = (x / 3) * 3;
        let y = (y / 3) * 3;

        for x in x..x + 3 {
            for y in y..y + 3 {
                if self.values[y][x] == number {
                    return false;
                }
            }
        }
        true
    }

    fn check_box(&self, x: usize, y: usize) -> Vec<u8> {
        let mut posible_numbers = Vec::new();
        for number in 1..10 {
            if self.check_line(number, y)
                && self.check_column(number, x)
                && self.check_grid(number, x, y)
            {
                posible_numbers.push(number);
            }
        }
        posible_numbers
    }

    pub fn solve_rng(&mut self, x: usize, y: usize) -> bool {
        if y > 8 {
            return true;
        }
        let (next_x, next_y) = Board::get_next_pos(x, y);
        if self.values[y][x] != 0 {
            return self.solve_rng(next_x, next_y);
        }
        let mut posible_numbers = self.check_box(x, y);
        posible_numbers.shuffle(&mut thread_rng());
        for number in posible_numbers {
            self.values[y][x] = number;
            if self.solve_rng(next_x, next_y) {
                return true;
            }
        }
        self.values[y][x] = 0;
        false
    }

    fn erase_casilla(&mut self) -> Option<[usize; 3]> {
        let x = thread_rng().gen_range(0, 9);
        let y = thread_rng().gen_range(0, 9);
        if self.values[y][x] == 0 {
            return None;
        }
        let old_value = self.values[y][x];
        self.values[y][x] = 0;
        if self.solutions(0, 0, 0) == 1 {
            let dificulty = self.get_dificulty();
            self.values[y][x] = old_value;
            return Some([x, y, dificulty]);
        }
        self.values[y][x] = old_value;
        None
    }

    fn solutions(&mut self, x: usize, y: usize, mut count: u8) -> u8 {
        if y > 8 {
            count += 1;
            return count;
        }
        let (next_x, next_y) = Board::get_next_pos(x, y);
        if self.values[y][x] != 0 {
            return self.solutions(next_x, next_y, count);
        }
        for number in self.check_box(x, y) {
            self.values[y][x] = number;
            count = self.solutions(next_x, next_y, count);
            if count > 1 {
                self.values[y][x] = 0;
                return count;
            }
        }
        self.values[y][x] = 0;
        count
    }

    pub fn get_dificulty(&self) -> usize {
        let mut guesses = 0;
        for y in 0..9 {
            for x in 0..9 {
                if self.values[y][x] != 0 {
                    continue;
                }
                guesses += usize::pow(self.check_box(x, y).len(), 2);
            }
        }
        guesses
    }

    pub fn get_value(&self, x: usize, y: usize) -> String {
        let value = self.values[y][x];
        if value != 0 {
            return value.to_string();
        }
        String::from(" ")
    }

    pub fn get_value_solution(&self, x: usize, y: usize) -> String {
        if let Some(solution) = self.solution {
            let value = solution[y][x];
            if value != 0 {
                return value.to_string();
            }
            return String::from(" ");
        }
        String::new()
    }

    pub fn print(&self) {
        log("┌───────┬───────┬───────┐");
        for y in 0..9 {
            let mut s = String::new();
            for x in 0..9 {
                if (x) % 3 == 0 {
                    s.push_str("│ ");
                }
                if self.values[y][x] != 0 {
                    s.push_str(&self.values[y][x].to_string());
                    s.push(' ');
                } else {
                    s.push_str(". ")
                }
            }
            s.push('│');
            log(&s);
            if (y + 1) % 3 == 0 && y != 8 {
                log("├───────┼───────┼───────┤");
            }
        }
        log("└───────┴───────┴───────┘");
    }

    pub fn print_solution(&self) {
        if let Some(solution) = self.solution {
            log("┌───────┬───────┬───────┐");
            for y in 0..9 {
                let mut s = String::new();
                for x in 0..9 {
                    if (x) % 3 == 0 {
                        s.push_str("│ ");
                    }
                    if solution[y][x] != 0 {
                        s.push_str(&solution[y][x].to_string());
                        s.push(' ');
                    } else {
                        s.push_str(". ")
                    }
                }
                s.push('│');
                log(&s);
                if (y + 1) % 3 == 0 && y != 8 {
                    log("├───────┼───────┼───────┤");
                }
            }
            log("└───────┴───────┴───────┘");
        }
    }

    pub fn set_state(&mut self, x: usize, y: usize, val: u8, tile_type: String) {
        match tile_type.as_str() {
            "normal" => self.state[y][x] = Tile::Normal(val),
            "static" => self.state[y][x] = Tile::Static(val),
            "error" => self.state[y][x] = Tile::Error(val),
            _ => log("ATENCION EL CAMBIO DE STATE NO ENTRO UN TILE VALIDO"),
        }
    }

    pub fn get_state(&mut self, x: usize, y: usize) -> String {
        self.state[y][x].name()
    }

    pub fn set_anotation(&mut self, x: usize, y: usize, number: usize, val: bool) {
        self.anotations[y][x][number] = val
    }

    pub fn get_anotation(&mut self, x: usize, y: usize, number: usize) -> bool {
        self.anotations[y][x][number]
    }

    pub fn is_finished(&self) -> bool {
        let solution = self.solution.unwrap();

        for y in 0..9 {
            for x in 0..9 {
                let val = self.state[y][x].get_value();
                if val == 0 {
                    //for testing
                    return true;
                }
                if solution[y][x] != val {
                    return false;
                }
            }
        }

        true
    }
}
