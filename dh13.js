const VERSION = "1.0.10"; { bankroll = 30000; kelly_fraction = 0.25; one_way_overround = 1.1; }
{
  let console_string = ""; console_log = function (string) { console_string = console_string + string + "\n"; }
  console_clear = function () { console_string = ""; }
  console_display = function () { return console_string; }
}
add_odds_dblclick_handlers = function () {
  for (row of rows()) {
    if (row.ondblclick) { return; }
    if (!row.classList.contains("hold-row")) { row.ondblclick = hide_other_rows; }
  }
}
setInterval(add_odds_dblclick_handlers, 100); hide_other_rows = function (event) {
  if (!event.currentTarget.querySelector(".total-col")) { return; }
  show_next_hold_row = false; total_value = event.currentTarget.querySelector(".total-col").textContent; background_color = "#2f3e4e"; for (row of all_rows()) {
    if (row.querySelector(".total-col").textContent == total_value) { row.ondblclick = show_other_rows; show_next_hold_row = true; set_row_color(row, background_color); }
    else if (!show_next_hold_row || !row.classList.contains("hold-row")) { row.hidden = true; }
    else {
      show_next_hold_row = false; set_row_color(row, background_color); if (background_color == "#2f3e4e") { background_color = "#263441"; }
      else { background_color = "#2f3e4e"; }
    }
  }
}
set_row_color = function (row, color) {
  row.style.backgroundColor = color; for (child of row.children) { child.style.backgroundColor = color; }
}
show_other_rows = function (event) {
  for (row of all_rows()) { row.hidden = false; row.ondblclick = null; set_row_color(row, null); }
}
{
  params = function () { return new URLSearchParams(window.location.search); }
  load_league = function () {
    league_list = document.querySelector("app-browse-odd-league-list"); if (!league_list) { setTimeout(load_league, 100); return; }
    if (!params().get("league")) { return; }
    leagues = league_list.querySelectorAll("mat-tree-node .tree-node-name"); if (!leagues.length) { setTimeout(load_league, 100); return; }
    for (league of leagues) {
      league_name = league.textContent.toUpperCase().replaceAll(" ", ""); league_value = params().get("league").toUpperCase().replaceAll(" ", ""); if (league_name == league_value) { league.click(); load_event(); }
    }
  }
  load_event = function () {
    events = document.querySelectorAll("app-browse-odds-event-summary-card"); if (!events.length) { setTimeout(load_event, 100); return; }
    team1 = params().get("team1").replaceAll(" ", ""); team2 = params().get("team2").replaceAll(" ", ""); for (event of events) {
      event_text = event.textContent.replaceAll(" ", ""); if (event_text.includes(team1) && event_text.includes(team2)) {
        for (odds of event.querySelectorAll("app-single-odds-box-widget")) {
          if (odds.textContent.trim() != "-") {
            event.querySelector("mat-card").firstChild.click()
            select_correct_market(); return;
          }
        }
      }
    }
  }
  dropdowns = function () { return document.querySelectorAll("mat-select"); }
  dropdown_options = function () { return document.getElementsByClassName("mat-option-text"); }
  select_correct_market = function () {
    if (!dropdowns().length) { setTimeout(select_correct_market, 100); return; }
    if (params().get("category") && dropdowns()[0].textContent.trim() != params().get("category")) { select_correct_category(); return; }
    if (dropdowns()[dropdowns().length - 1].textContent.trim() == params().get("market")) { scroll_to_bet(); return; }
    if (!dropdown_options().length) { dropdowns()[dropdowns().length - 1].click(); wait_until_dropdowns_open(select_correct_market); return; }
    for (dropdown_option of dropdown_options()) {
      if (dropdown_option.textContent.trim() == params().get("market") || dropdown_option.textContent.trim().replace("Total Goals", "Total Score") == params().get("market") || dropdown_option.textContent.trim().replace("Total Runs", "Total Score") == params().get("market")) { dropdown_option.click(); wait_until_dropdowns_close(scroll_to_bet); return; }
    }
    document.getElementsByClassName("mat-selected")[0].click(); wait_until_dropdowns_close(select_next_category);
  }
  select_correct_category = function () {
    if (!document.querySelector("app-browse-odds-table")) { setTimeout(select_correct_category, 100); return; }
    if (!dropdown_options().length) { dropdowns()[0].click(); wait_until_dropdowns_open(select_correct_category); return; }
    for (dropdown_option of dropdown_options()) {
      if (dropdown_option.textContent.trim() == params().get("category")) { dropdown_option.click(); wait_until_dropdowns_close(select_correct_segment); return; }
    }
  }
  select_correct_segment = function () {
    if (!params().get("segment")) { select_correct_market(); return; }
    if (!dropdown_options().length) { dropdowns()[1].click(); wait_until_dropdowns_open(select_correct_segment); return; }
    for (dropdown_option of dropdown_options()) {
      if (params().get("segment") == dropdown_option.textContent.trim()) { dropdown_option.click(); wait_until_dropdowns_close(select_correct_market); return; }
    }
  }
  select_next_category = function () {
    if (!dropdown_options().length) { dropdowns()[0].click(); wait_until_dropdowns_open(select_next_category); return; }
    for (dropdown_option of dropdown_options()) {
      if (dropdown_option.parentElement.classList.contains("mat-selected") && dropdown_option.parentElement.nextElementSibling) { dropdown_option.parentElement.nextElementSibling.firstElementChild.click(); wait_until_dropdowns_close(select_correct_market); return; }
    }
  }
  scroll_to_bet = function () {
    if (!rows().length) { setTimeout(scroll_to_bet, 100); return; }
    books = Array.from(document.querySelectorAll("app-sportsbook-icon img")).map(x => x.getAttribute("alt")); book_index = books.indexOf(params().get("book")); for (row of rows()) {
      if (row.textContent.replaceAll(" ", "").includes(params().get("value").replaceAll(" ", ""))) {
        book_cell = cells_for_row(row)[book_index]; if (book_cell.textContent.trim() == "-") { continue; }
        make_cell_soft(book_cell); make_row_sharp(row); row.scrollIntoView({ behavior: "smooth", block: "center" }); return;
      }
    }
  }
  wait_until_dropdowns_close = function (f) {
    if (dropdown_options().length) { setTimeout(wait_until_dropdowns_close, 100, f); return; }
    f();
  }
  wait_until_dropdowns_open = function (f) {
    if (!dropdown_options().length) { setTimeout(wait_until_dropdowns_open, 100, f); return; }
    f();
  }
}
{
  check_for_profit = function () {
    profits = document.getElementsByClassName("profit-col"); for (profit of profits) {
    //profit = document.getElementsByClassName("profit-col").length;
     // console.warn("warning");  
      console.error(profit);
    }
  }


  check_for_autorefresh = function () {
    new_odds = document.getElementsByClassName("mat-warn"); if (new_odds.length && new_odds[0].textContent == " update ") { new_odds[0].click(); setTimeout(refresh_odds, 100); }
  }
  refresh_odds = function () {
    buttons = Array.from(document.getElementsByClassName("mat-button-wrapper")); for (button of buttons) {
      if (button.textContent == " Update ") { button.click(); }
    }
  }
  add_bet_finder_events = function () {
    markets = document.querySelectorAll(".primary-market-col, .hedge-market-col"); for (market of markets) {
      if (!market.ondblclick) { market.ondblclick = market_dblclicked; }
    }
    events = document.querySelectorAll("td.event-col"); for (event of events) {
      if (!event.ondblclick) { event.ondblclick = event_dblclicked; }
    }
  }
  sanitized_params = function (parameters) {
    sanitized = JSON.parse(JSON.stringify(parameters)); switch (sanitized.league) { case "EPL": sanitized.league = "Premier League"; break; case "BULIGA": sanitized.league = "Bundesliga"; break; }; switch (sanitized.segment) { case "1st Quarter": case "2nd Quarter": case "3rd Quarter": case "4th Quarter": sanitized.segment = sanitized.segment.split(" Quarter")[0]; sanitized.category = "Quarters"; break; case "1st Half": case "2nd Half": sanitized.segment = sanitized.segment.split(" Half")[0]; sanitized.category = "Halves"; break; case "1st Period": case "2nd Period": case "3rd Period": sanitized.segment = sanitized.segment.split(" Period")[0]; sanitized.category = "Periods"; break; case "1st Set": case "2nd Set": case "3rd Set": case "4th Set": case "5th Set": delete sanitized.segment; sanitized.category = "Set Lines"; break; }; switch (sanitized.market) {
      case "Total": sanitized.market = "Total Score"; break; case "Alt Spread": case "Spread": if (sanitized.category) { sanitized.market = "Spread"; }
        sanitized.value = sanitized.value.replace("+", ""); break; case "Alt Total": if (sanitized.category) { sanitized.market = "Total Score"; }
        else { sanitized.market = "Alt Total Score" }
        break; case "Alt Total Match Games": case "Total Match Games": sanitized.market = sanitized.market.replace("Match Games", "Games");
    }
    return sanitized;
  }
  market_dblclicked = function (event) {
    event_col_texts = textNodes(event.currentTarget.parentElement.getElementsByClassName("event-col")[0].childNodes); league = event_col_texts[0].textContent.trim(); team1 = event_col_texts[1].textContent.trim(); team2 = event_col_texts[2].textContent.trim(); market_col = event.currentTarget; market = market_col.querySelector("app-market-chip").textContent.trim()
    segment = market_col.querySelector("app-segment-chip") ? market_col.querySelector("app-segment-chip").textContent.trim() : null; value = market_col.getElementsByClassName("market")[0].textContent.trim(); book_col = market_col.classList.contains("primary-market-col") ? market_col.previousElementSibling : market_col.nextElementSibling; book = book_col.querySelector("img").getAttribute("alt"); parameters = { league: league, team1: team1, team2: team2, market: market, segment: segment, value: value, book: book }; if (!segment) { delete parameters.segment; }
    sanitized_parameters = sanitized_params(parameters); browse_odds_url = "https://darkhorseodds.com/browse-odds?"; for (param in sanitized_parameters) { browse_odds_url = browse_odds_url + param + "=" + encodeURIComponent(sanitized_parameters[param]) + "&"; }
    window.open(browse_odds_url);
  }
  const dimmed_class = "dimmed-class"; const dimmed_storage_key = "dimmed-keys"; load_dimmed_keys = function () { return JSON.parse(localStorage.getItem(dimmed_storage_key)) || {}; }
  save_dimmed_keys = function (dimmed_keys) { localStorage.setItem(dimmed_storage_key, JSON.stringify(dimmed_keys)); }
  dimmed_key_from_row = function (row) { market_col = row.querySelector(".primary-market-col"); event_col = row.querySelector(".event-col"); return event_col.textContent + market_col.textContent; }
  event_dblclicked = function (event) {
    dimmed_keys = load_dimmed_keys(); row = event.currentTarget.parentElement; if (event.currentTarget.classList.contains(dimmed_class)) { delete dimmed_keys[dimmed_key_from_row(row)]; save_dimmed_keys(dimmed_keys); event.currentTarget.classList.remove(dimmed_class); event.currentTarget.parentElement.style.opacity = 1.0; }
    else { dimmed_keys[dimmed_key_from_row(row)] = Date.now() + 60 * 60 * 12 * 1000; save_dimmed_keys(dimmed_keys); event.currentTarget.classList.add(dimmed_class); event.currentTarget.parentElement.style.opacity = 0.1; }
  }
  dim_rows = function (event) {
    dimmed_keys = load_dimmed_keys(); for (row of document.querySelectorAll("tr[app-matched-bet-result-row]")) {
      if (dimmed_keys[dimmed_key_from_row(row)]) { row.style.opacity = 0.1; }
      else { row.style.opacity = 1.0; }
    }
  }
  delete_old_data = function () {
    dimmed_keys = load_dimmed_keys(); for (dimmed_key in dimmed_keys) {
      if (parseInt(dimmed_keys[dimmed_key]) < Date.now()) { delete dimmed_keys[dimmed_key]; }
    }
    save_dimmed_keys(dimmed_keys);
  }
  textNodes = function (nodes) {
    let output = []; for (node of Array.from(nodes)) {
      if (node.nodeType == 3) { output.push(node); }
    }
    return output;
  }
}
{
  cells = function () { return document.querySelectorAll("tr.odds-row-bottom td.book-col, tr.odds-row-top td.book-col,tr.odds-row-middle td.book-col"); }
  rows = function () { return document.querySelectorAll("tr.odds-row-top, tr.odds-row-middle, tr.odds-row-bottom"); }
  all_rows = function () { return document.querySelectorAll("tr.odds-row-top, tr.odds-row-middle, tr.odds-row-bottom, tr.hold-row"); }
  add_devigging_events = function () {
    for (cell of cells()) {
      if (cell.onmouseover) { continue; }
      cell.onmouseover = add_devigged_odds_to_title; cell.oncontextmenu = add_to_parlay; cell.onclick = toggle_soft_line; cell.ondblclick = function (event) { event.stopPropagation() };
    }
  }
  cells_for_row = function (row) { return row.querySelectorAll("td.book-col"); }
  row_for_cell = function (cell) { return cell.parentElement; }
  const soft_class = "soft-class"; const sharp_class = "sharp-class"; toggle_soft_line = function (event) {
    cell = event.currentTarget; if (row_for_cell(cell).getElementsByClassName(parlay_class).length || cell.textContent.trim() == "-") { return; }
    if (event.currentTarget.classList.contains(soft_class)) { make_row_normal(row_for_cell(cell)); }
    else { make_cell_soft(cell); make_row_sharp(row_for_cell(cell)); }
  }
  make_row_sharp = function (row) {
    soft_cell = row.querySelector(`.${soft_class}`); if (!soft_cell) { setTimeout(make_row_sharp, 100, row); return; }
    for (cell of cells_for_row(row)) {
      if (cell.classList.contains(soft_class)) { continue; }
      make_cell_sharp(cell, soft_cell);
    }
  }
  make_cell_sharp = function (cell, soft_cell) {
    soft_odds = parseInt(soft_cell.textContent); devigged_cell_odds = parseInt(devigged_odds_for_cell(cell).power); if (isNaN(devigged_cell_odds)) { return; }
    ev_bet = soft_odds > devigged_cell_odds; background_color = ev_bet ? "LightGreen" : "LightPink"; cell.classList.add(sharp_class); cell.firstElementChild.firstElementChild.style.color = "Black"; cell.firstElementChild.firstElementChild.style.backgroundColor = background_color; add_ev_to_title(cell, soft_cell);
  }
  make_cell_soft = function (cell) {
    for (previous_soft_cell of row_for_cell(cell).getElementsByClassName(soft_class)) { previous_soft_cell.classList.remove(soft_class); }
    cell.classList.add(soft_class); cell.firstElementChild.firstElementChild.style.color = "Black"; cell.firstElementChild.firstElementChild.style.backgroundColor = "Yellow";
  }
  make_row_normal = function (row) {
    for (cell of cells_for_row(row)) { make_cell_normal(cell); }
  }
  make_cell_normal = function (cell) { cell.classList.remove(soft_class); cell.classList.remove(sharp_class); cell.classList.remove(parlay_class); cell.firstElementChild.firstElementChild.style.backgroundColor = "rgb(29, 39, 49)"; cell.firstElementChild.firstElementChild.style.color = "White"; cell.removeAttribute("title"); }
  const parlay_class = "parlay-class"; const parlay_key = "parlay-key"; parlay_data = function () { return JSON.parse(localStorage.getItem(parlay_key)) || []; }
  save_parlay_data = function (data) { localStorage.setItem(parlay_key, JSON.stringify(data)); }
  add_to_parlay = function (event) {
    console_log("added_to_parlay"); cell = event.currentTarget; if (cell.textContent.trim() == "-" || cell.classList.contains(sharp_class) || cell.classList.contains(soft_class)) { return true; }
    data = parlay_data(); data.push(leg_data_from_cell(cell)); save_parlay_data(data); highlight_parlay_cell(cell); update_parlay_cell_titles(); return false;
  }
  highlight_parlay_cell = function (cell) { cell.oncontextmenu = remove_from_parlay; cell.classList.add(parlay_class); cell.firstElementChild.firstElementChild.style.backgroundColor = "LightBlue"; cell.firstElementChild.firstElementChild.style.color = "Black"; update_parlay_cell_titles(); }
  leg_data_from_cell = function (cell) { row = row_for_cell(cell); index = Array.from(cells()).indexOf(cell); side = Array.from(row.querySelectorAll(".row-header-col")).map(x => x.textContent.trim()).join(" "); title = document.querySelector("mat-card-title").textContent; market_info = Array.from(dropdowns()).map(x => x.textContent).join(); devigged_odds = devigged_odds_for_cell(cell); return ({ side: side, odds: devigged_odds.power, title: title, dropdown: market_info, index: index }); }
  update_parlay_cell_titles = function () {
    data = parlay_data(); fair_parlay_percentage = 1; for (leg of data) { fair_parlay_percentage = odds_to_percentage(leg.odds) * fair_parlay_percentage; }
    for (cell of document.getElementsByClassName(parlay_class)) { cell.title = data.map(x => x.side + " " + x.odds).join("\n") + "\nFair: " + percentage_to_odds(fair_parlay_percentage); }
  }
  remove_from_parlay = function (event) { cell = event.currentTarget; cell.oncontextmenu = add_to_parlay; make_cell_normal(event.currentTarget); data = parlay_data(); leg_data = leg_data_from_cell(cell); data = data.filter(x => x.title != leg_data.title || x.dropdown != leg_data.dropdown || x.index != leg_data.index); save_parlay_data(data); update_parlay_cell_titles(); return false; }
  highlight_parlay_members = function () {
    parlay_checked_class = "parlay-checked"; if (!parlay_data().length || document.querySelector(`.${parlay_checked_class}`)) { return; }
    for (cell of cells()) {
      leg_data = leg_data_from_cell(cell); if (parlay_data().filter(x => x.index == leg_data.index && x.title == leg_data.title && x.dropdown == leg_data.dropdown).length) { highlight_parlay_cell(cell); }
      cell.classList.add(parlay_checked_class);
    }
  }
  clear_parlay = function () { save_parlay_data([]); }
  add_devigged_odds_to_title = function (event) {
    cell = event.currentTarget; if (isNaN(parseFloat(cell.textContent))) { return; }
    devigged_odds = devigged_odds_for_cell(cell); devigged_percentages = devigged_percentages_for_cell(cell); if (!cell.title) { cell.title = `Fair: ${(devigged_odds.power)} (${(devigged_percentages.power * 100).toFixed(1)}%)`; }
  }
  add_ev_to_title = function (sharp_cell, soft_cell) { sharp_odds = devigged_odds_for_cell(sharp_cell); sharp_percentages = devigged_percentages_for_cell(sharp_cell); soft_percentages = devigged_percentages_for_cell(soft_cell); ev = (expected_value(sharp_percentages.power, soft_cell.textContent) * 100).toFixed(1) + "%"; full_kelly = kelly_percentage(sharp_percentages.power, soft_cell.textContent); full_kelly_bet = "$" + (bankroll * full_kelly).toFixed(); full_kelly_pct = (full_kelly * 100).toFixed(1) + "%"; fractional_kelly_bet = "$" + (full_kelly * bankroll * kelly_fraction).toFixed(); fractional_kelly_pct = (full_kelly * 100 * kelly_fraction).toFixed(1) + "%"; sharp_cell.title = `Fair: ${sharp_odds.power} (${(100 * sharp_percentages.power).toFixed(1)}%)\nEV: ${ev}\nFull Kelly: ${full_kelly_bet} (${full_kelly_pct})\nFractional Kelly: ${fractional_kelly_bet} (${fractional_kelly_pct})`; }
  kelly_percentage = function (win_percentage, odds) {
    odds = parseFloat(odds); fractional_odds = odds / 100; if (odds < 0) { fractional_odds = -100 / odds; }
    win_percentage = parseFloat(win_percentage); return Math.max(0, win_percentage - (1 - win_percentage) / fractional_odds);
  }
  expected_value = function (win_percentage, odds) {
    odds = parseFloat(odds); win_percentage = parseFloat(win_percentage); if (odds > 0) { return (win_percentage * odds - 100 * (1.0 - win_percentage)) / 100; }
    return (100 * win_percentage + odds * (1.0 - win_percentage)) / (-odds);
  }
  devigged_percentages_for_cell = function (cell) { devigged_odds = devigged_odds_for_cell(cell); return { power: odds_to_percentage(devigged_odds.power), standard: odds_to_percentage(devigged_odds.standard) }; }
  devigged_odds_for_cell = function (cell) {
    odds = [cell.textContent]; row = row_for_cell(cell); cell_index = Array.from(row.childNodes).indexOf(cell); if (row.classList.contains("odds-row-top") || row.classList.contains("odds-row-middle")) {
      odds.push(row.nextElementSibling.childNodes[cell_index].textContent); if (row.nextElementSibling.classList.contains("odds-row-middle")) { odds.push(row.nextElementSibling.nextElementSibling.childNodes[cell_index].textContent); }
    }
    if (row.classList.contains("odds-row-bottom") || row.classList.contains("odds-row-middle")) {
      odds.push(row.previousElementSibling.childNodes[cell_index].textContent); if (row.previousElementSibling.classList.contains("odds-row-middle")) { odds.push(row.previousElementSibling.previousElementSibling.childNodes[cell_index].textContent); }
    }
    return { standard: devigged_standard(odds), power: devigged_power(odds) };
  }
  parse_odds_to_percentages = function (odds) {
    percentages = odds.map(o => isNaN(parseFloat(o)) ? 0 : odds_to_percentage(o)); total_overround = percentages.reduce((overround, percentage) => overround + percentage); if (total_overround == 0) { return null; }
    percentages = percentages.map(percentage => percentage == 0 ? one_way_overround - total_overround : percentage); return percentages;
  }
  devigged_standard = function (odds) {
    percentages = parse_odds_to_percentages(odds); if (!percentages) { return null; }
    overround = percentages.reduce((accumulated_overround, percentage) => accumulated_overround = accumulated_overround + percentage); return percentage_to_odds(percentages[0] / overround);
  }
  devigged_power = function (odds) {
    percentages = parse_odds_to_percentages(odds); if (!percentages) { return null; }
    pows = [1.0, 10.0]; for (i = 0; i < 100; i++) {
      pow = (pows[0] + pows[1]) / 2; overround = 0; for (percentage of percentages) { overround = overround + Math.pow(percentage, pow); }
      if (overround < 1.0) { pows = [pows[0], pow]; }
      else { pows = [pow, pows[1]]; }
    }
    return percentage_to_odds(Math.pow(percentages[0], (pows[0] + pows[1]) / 2.0));
  }
  odds_to_percentage = function (odds) {
    odds = parseFloat(odds); if (odds > 0) { return 100.0 / (100.0 + odds); }
    else { return odds / (odds - 100); }
  }
  percentage_to_odds = function (percentage) {
    percentage = parseFloat(percentage); if (percentage > 0.5) { return -1 * Math.round((100 * percentage) / (1 - percentage)); }
    return "+" + Math.round(100 * (1 - percentage) / percentage);
  }
}
{check_for_profit_percentage = setInterval(check_for_profit, 1000); go_to_markets_events_id = setInterval(add_bet_finder_events, 100); check_for_autorefresh_id = setInterval(check_for_autorefresh, 100); devigging_events_id = setInterval(add_devigging_events, 100); dim_rows_id = setInterval(dim_rows, 100); delete_old_data = setInterval(delete_old_data, 30000); highlight_parlay_cell_id = setInterval(highlight_parlay_members, 100); load_league(); clear_parlay(); }