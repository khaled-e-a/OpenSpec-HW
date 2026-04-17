use std::io::{self, IsTerminal, Write};
use std::process::ExitCode;

use chrono::Datelike;
use rust_cli_calendar::{render_month_styled, today_date};

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().collect();
    if args.len() > 1 {
        let _ = writeln!(io::stderr(), "usage: rust-cli-calendar");
        return ExitCode::from(2);
    }

    let is_tty = io::stdout().is_terminal();

    let date = match today_date() {
        Ok(d) => d,
        Err(err) => {
            let _ = writeln!(io::stderr(), "error: {err}");
            return ExitCode::from(1);
        }
    };

    let output = render_month_styled(date.year(), date.month(), Some(date.day()), is_tty);
    let stdout = io::stdout();
    let mut handle = stdout.lock();
    if let Err(err) = handle
        .write_all(output.as_bytes())
        .and_then(|_| handle.flush())
    {
        let _ = writeln!(io::stderr(), "error: {err}");
        return ExitCode::from(1);
    }
    ExitCode::SUCCESS
}
