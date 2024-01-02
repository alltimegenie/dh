// ==UserScript==
// @name         devin's dh improvements
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  dh improvements
// @author       Devin Shelly
// @match        https://darkhorseodds.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=darkhorseodds.com
// @grant        none
// ==/UserScript==
​
​
/* Variables and debugging */
{
  VERSION = "1.0.4";
  bankroll = 30000;
  kelly_fraction = 0.5;
  one_way_overround = 1.07;
  soft_class = "soft-class";
  sharp_class = "sharp-class";
  parlay_class = "parlay-class";
  parlay_key = "parlay-key";
​
  set_title = function()
  {
    title = "DarkHorse Odds v" + VERSION;
    if(document.title != title)
    {
      document.title = title;
    }
  }
  setInterval(set_title, 1000);
}
​
// /* DH seems to disable the console, so a quick workaround */
// {
//   var i = document.createElement('iframe');
//   i.style.display = 'none';
//   document.body.appendChild(i);
//   window.console = i.contentWindow.console;
// }
​
/* Loading markets from parameterized browse-odds URL */
{
  params = function()
  {
    return new URLSearchParams(window.location.search);
  }
​
  load_league = function()
  {
    league_list = document.querySelector("app-browse-odd-league-list");
    if (!league_list)
    {
      setTimeout(load_league, 100);
      return;
    }
​
    if(!params().get("league"))
    {
      return;
    }
​
    leagues = league_list.querySelectorAll("mat-tree-node .tree-node-name");
    if(!leagues.length)
    {
      setTimeout(load_league, 100);
      return;
    }
    for(league of leagues)
    {
      league_name = league.textContent.toUpperCase().replaceAll(" ", "");
      league_value = params().get("league").toUpperCase().replaceAll(" ", "");
      if(league_name == league_value)
      {
        league.click();
        load_event();
      }
    }
  }
​
  load_event = function()
  {
    events = document.querySelectorAll("app-browse-odds-event-summary-card");
    if(!events.length)
    {
      setTimeout(load_event, 100);
      return;
    }
​
    team1 = params().get("team1").replaceAll(" ", "");
    team2 = params().get("team2").replaceAll(" ", "");
​
    for(event of events)
    {
      event_text = event.textContent.replaceAll(" ", "");
      if(event_text.includes(team1) && event_text.includes(team2))
      {
        for(odds of event.querySelectorAll("app-single-odds-box-widget"))
        {
          if(odds.textContent.trim() != "-")
          {
            event.querySelector("mat-card").firstChild.click()
            select_correct_market();
            return;
          }
        }
​
      }
    }
  }
​
  dropdowns = function()
  {
    return document.querySelectorAll("mat-select");
  }
​
  dropdown_options = function()
  {
    return document.querySelectorAll("mat-option");
  }
​
  ///TODO: Implement this if possible
  scroll_to_bet = function()
  {
    rows = document.querySelectorAll("div[row-index]");
    for(info_row of rows)
    {
      correct_row = true;
      for(word of params().get("value").split(" "))
      {
        first_initial = word[0] + ".";
        if(info_row.textContent.indexOf(word) == -1 && info_row.textContent.indexOf(first_initial) == -1)
        {
          correct_row = false;
          break;
        }
      }
      if(correct_row)
      {
        info_row.scrollIntoView(true);
        books = Array.from(document.querySelectorAll(".ag-header-row img")).map(x=>x.getAttribute("alt"))
        book_index = books.indexOf(params().get("book"));
        row = row_for_info_row(info_row);
        cell = cells_for_row(row)[book_index];
        make_cell_soft(cell);
        make_row_sharp(row);
        return;
      }
    }
    gridElement = document.querySelector(".ag-body-viewport");
    if(gridElement.scrollTop + gridElement.offsetHeight + 1 < gridElement.scrollHeight)
    {
      gridElement.scrollBy(0, gridElement.offsetHeight);
      setTimeout(scroll_to_bet, 200);
    }
    else
    {
      gridElement.scrollTo(0, 0);
      setTimeout(scroll_to_bet, 200);
    }
​
  }
​
  find_soft_cell = function(info_row)
  {
    row = row_for_info_row(info_row);
    for(cell of cells_for_row(row))
    {
​
    }
  }
​
  select_correct_market = function()
  {
    //Page hasn't loaded yet
    if(dropdowns().length == 0)
    {
      setTimeout(select_correct_market, 100);
      return;
    }
​
    /* Select the correct category and then return if not already selected */
    if(params().get("category") && dropdowns()[0].textContent.trim() != params().get("category"))
    {
      select_correct_category();
      return;
    }
​
    /* If the market is already selected, scroll to the correct bet */
    if(dropdowns()[dropdowns().length-1].textContent.trim() == params().get("market"))
    {
      scroll_to_bet();
      return;
    }
​
    /* Open the market dropdowns if not open */
    if(!dropdown_options().length)
    {
      dropdowns()[dropdowns().length-1].click();
      wait_until_dropdowns_open(select_correct_market);
      return;
    }
​
    /* Select the correct market if available */
    for(dropdown_option of dropdown_options())
    {
      /*Check for exact match or where Total Score is equivalent to Total Goals or Total Runs */
      if(dropdown_option.textContent.trim() == params().get("market") || dropdown_option.textContent.trim().replace("Total Goals", "Total Score").replace("Total Runs", "Total Score") == params().get("market") || dropdown_option.textContent.trim().replace("Total Runs", "Total Score") == params().get("market"))
      {
        dropdown_option.click();
        wait_until_dropdowns_close(scroll_to_bet);
        return;
      }
    }
​
    //if there is no correct market, close the dropdown and select the next category
    document.getElementsByClassName("mat-selected")[0].click();
    wait_until_dropdowns_close(select_next_category);
  }
​
  select_correct_category = function()
  {
    //Open the market categories if not already opened
    if(!dropdown_options().length)
    {
      dropdowns()[0].click();
      wait_until_dropdowns_open(select_correct_category);
      return;
    }
​
    for(dropdown_option of dropdown_options())
    {
      if(dropdown_option.textContent.trim() == params().get("category"))
      {
        dropdown_option.click();
        wait_until_dropdowns_close(select_correct_segment);
        return;
      }
    }
  }
​
  select_correct_segment = function()
  {
    console.log("selecting correct segment");
​
    /* Select correct market if no segment available */
    if(!params().get("segment"))
    {
      select_correct_market();
      return;
    }
​
    //open the segment dropdown if not open
    if(!dropdown_options().length)
    {
      dropdowns()[1].click();
      wait_until_dropdowns_open(select_correct_segment);
      return;
    }
​
    //open the correct segment, then select the market
    for(dropdown_option of dropdown_options())
    {
      if(params().get("segment") == dropdown_option.textContent.trim())
      {
        dropdown_option.click();
        wait_until_dropdowns_close(select_correct_market);
        return;
      }
    }
  }
​
  select_next_category = function()
  {
    //open the categories if closed and try again
    if(!dropdown_options().length)
    {
      dropdowns()[0].click();
      wait_until_dropdowns_open(select_next_category);
      return;
    }
​
    //click the next category and then select correct market
    for(dropdown_option of dropdown_options())
    {
      if(dropdown_option.parentElement.classList.contains("mat-selected") && dropdown_option.parentElement.nextElementSibling)
      {
        dropdown_option.parentElement.nextElementSibling.firstElementChild.click();
        wait_until_dropdowns_close(select_correct_market);
        return;
      }
    }
​
    //If we've somehow reached the end, close the menu and do nothing
    //dropdown_option.click();
  }
​
  wait_until_dropdowns_close = function(f)
  {
    if(dropdown_options().length)
    {
      setTimeout(wait_until_dropdowns_close, 100, f);
      return;
    }
​
    f();
  }
​
  wait_until_dropdowns_open = function(f)
  {
    if(!dropdown_options().length)
    {
      setTimeout(wait_until_dropdowns_open, 100, f);
      return;
    }
​
    f();
  }
}
​
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
/* Generating parameterized browse-odds URLs from bet finders and autorefreshing bets */
{
​
  refresh_odds = async function()
  {
    const clockBtn = document.querySelector(".mat-warn");
    if (!clockBtn || clockBtn.textContent !== " update ") return
​
    clockBtn.click()
    await delay(100);
    const updateBtn = document.querySelector('#mat-menu-panel-2 > div > div > div:nth-child(2) > button');
    if (updateBtn.disabled || updateBtn.textContent !== ' Update ') return
​
    updateBtn.click()
  }
​
  add_bet_finder_events = function()
  {
    markets = document.querySelectorAll(".primary-market-col, .hedge-market-col");
    for(market of markets)
    {
      if(!market.ondblclick )
      {
        market.ondblclick = market_dblclicked;
      }
    }
​
    events = document.querySelectorAll("td.event-col");
    for(event of events)
    {
      if(!event.ondblclick)
      {
        event.ondblclick = event_dblclicked;
      }
    }
​
  }
​
  /* Fix any discrepancies between bet finder and browse odds manually */
  sanitized_params = function(parameters)
  {
    sanitized = JSON.parse(JSON.stringify(parameters));
    console.log("Presanitized");
    console.log(sanitized);
    switch (sanitized.league) {
      case "EPL":
        sanitized.league = "Premier League";
        break;
      case "BULIGA":
        sanitized.league = "Bundesliga";
        break;
      case "UEFA-CL":
        sanitized.league = "UEFA Champions";
        break;
      case "UEFA-EL":
        sanitized.league = "UEFA Europa";
        break;
      case "WBC":
        sanitized.league = "World Baseball Classic";
        break;
    };
​
    switch (sanitized.segment) {
      case "1st Quarter":
      case "2nd Quarter":
      case "3rd Quarter":
      case "4th Quarter":
        sanitized.segment = sanitized.segment.split(" Quarter")[0];
        sanitized.category = "Quarters";
        break;
      case "1st Half":
      case "2nd Half":
        sanitized.segment = sanitized.segment.split(" Half")[0];
        sanitized.category = "Halves";
        break;
      case "1st Period":
      case "2nd Period":
      case "3rd Period":
        sanitized.segment = sanitized.segment.split(" Period")[0];
        sanitized.category = "Periods";
        break;
      case "1st Set":
      case "2nd Set":
      case "3rd Set":
      case "4th Set":
      case "5th Set":
        delete sanitized.segment;
        sanitized.category = "Set Lines";
        break;
      case "1st Inning":
        sanitized.category = "Innings";
        sanitized.segment = "1st";
        break;
      case "Innings 1-5":
        sanitized.category = "Innings";
        sanitized.segment = "1-5";
        break;
    };
​
    switch(sanitized.market)
    {
      case "Total":
        sanitized.market = "Total Score";
        break;
      case "Alt Spread":
      case "Spread":
        if(sanitized.category)
        {
          sanitized.market = "Spread";
        }
        sanitized.value = sanitized.value.replace("+", "");
        break;
      case "Alt Total":
        if(sanitized.category)
        {
          sanitized.market = "Total Score";
        }
        else
        {
          sanitized.market = "Alt Total Score"
        }
        break;
      case "Alt Total Match Games":
      case "Total Match Games":
        sanitized.market = sanitized.market.replace("Match Games", "Games");
​
    }
​
    sanitized.value = sanitized.value.replace("Under ", " u").replace("Over ", " o");
    console.log("Sanitized");
    console.log(sanitized);
    return sanitized;
  }
​
  market_dblclicked = function(event)
  {
    event_col_texts = textNodes(event.currentTarget.parentElement.getElementsByClassName("event-col")[0]);
    console.log(event.currentTarget);
    league = event_col_texts[0].textContent.trim();
    team1 = event_col_texts[1].textContent.trim();
    team2 = event_col_texts[2].textContent.trim();
​
    market_col = event.currentTarget;
    market = market_col.querySelector("app-market-chip").textContent.trim()
    segment = market_col.querySelector("app-segment-chip") ? market_col.querySelector("app-segment-chip").textContent.trim() : null;
    value = market_col.getElementsByClassName("market")[0].textContent.trim();
    book_col = market_col.classList.contains("primary-market-col") ? market_col.previousElementSibling : market_col.nextElementSibling;
    book = book_col.querySelector("img").getAttribute("alt");
    parameters = {league: league, team1: team1, team2: team2, market: market, segment: segment, value: value, book: book};
​
    if(!segment)
    {
      delete parameters.segment;
    }
    sanitized_parameters = sanitized_params(parameters);
​
    browse_odds_url = "https://darkhorseodds.com/browse-odds?";
    for(param in sanitized_parameters)
    {
      browse_odds_url = browse_odds_url + param + "=" + encodeURIComponent(sanitized_parameters[param]) + "&";
    }
    window.open(browse_odds_url);
  }
​
  const dimmed_class = "dimmed-class";
  const dimmed_storage_key = "dimmed-keys";
  load_dimmed_keys = function()
  {
    return JSON.parse(localStorage.getItem(dimmed_storage_key)) || {};
  }
​
  save_dimmed_keys = function(dimmed_keys)
  {
    localStorage.setItem(dimmed_storage_key, JSON.stringify(dimmed_keys));
  }
​
  dimmed_key_from_row = function(row)
  {
    market_col = row.querySelector(".primary-market-col");
    event_col = row.querySelector(".event-col");
    return event_col.textContent + market_col.textContent;
  }
​
  event_dblclicked = function(event)
  {
    dimmed_keys = load_dimmed_keys();
    row = event.currentTarget.parentElement;
​
    if(event.currentTarget.classList.contains(dimmed_class))
    {
      delete dimmed_keys[dimmed_key_from_row(row)];
      save_dimmed_keys(dimmed_keys);
      event.currentTarget.classList.remove(dimmed_class);
      event.currentTarget.parentElement.style.opacity = 1.0;
    }
    else
    {
      dimmed_keys[dimmed_key_from_row(row)] = Date.now() + 60*60*12*1000;
      save_dimmed_keys(dimmed_keys);
      event.currentTarget.classList.add(dimmed_class);
      event.currentTarget.parentElement.style.opacity = 0.1;
    }
  }
​
  dim_rows = function(event)
  {
    dimmed_keys = load_dimmed_keys();
    for(row of document.querySelectorAll("tr[app-matched-bet-result-row]"))
    {
      if(dimmed_keys[dimmed_key_from_row(row)])
      {
        row.style.opacity = 0.1;
      }
      else
      {
        row.style.opacity = 1.0;
      }
    }
  }
​
  delete_old_data = function()
  {
    dimmed_keys = load_dimmed_keys();
    for(dimmed_key in dimmed_keys)
    {
      if(parseInt(dimmed_keys[dimmed_key]) < Date.now())
      {
        delete dimmed_keys[dimmed_key];
      }
    }
    save_dimmed_keys(dimmed_keys);
  }
​
  textNodes = function(node)
  {
    console.log(node);
    let output = [];
    if(node.nodeType == 3)
    {
      output.push(node);
      return output;
    }
    for(child of node.childNodes)
    {
      output.push(...textNodes(child));
    }
    return output;
  }
}
​
/* Devigging math methods */
{
  devigged_power = function(odds_array)
  {
    if(!odds_array.length)
    {
      return null;
    }
    percentages = odds_array.map(x=> odds_to_percentage(parseFloat(x)));
    if(percentages.length == 1)
    {
      percentages.push(one_way_overround*100 - percentages[0]);
    }
​
    pows = [1.0, 10.0];
    pow = 5.5;
    for(i = 0; i<100; i++)
    {
      pow = (pows[0] + pows[1])/2;
      overround = 0;
      for(percentage of percentages)
      {
        overround = overround + Math.pow(percentage/100, pow);
      }
      if(overround < 1.0)
      {
        pows = [pows[0], pow];
      }
      else
      {
        pows = [pow, pows[1]];
      }
    }
    return percentages.map(x=> percentage_to_odds(100*Math.pow(x/100, pow)));
  }
​
  odds_to_percentage = function(odds)
  {
    odds = parseFloat(odds);
    if(odds > 0)
    {
      return 100.0*100.0/(100.0 + odds);
    }
    else
    {
      return 100*odds/(odds-100);
    }
  }
​
  percentage_to_odds = function(percentage)
  {
    percentage = parseFloat(percentage);
    if(percentage > 50)
    {
      return -1*Math.round(100*percentage/(100-percentage));
    }
​
    return "+" + Math.round(100*(1-percentage/100)/(percentage/100));
  }
​
  kelly_percentage = function(odds, fair_odds)
  {
    odds = parseFloat(odds);
    fractional_odds = odds < 0 ? -100/odds : odds/100;
    fair_percentage = odds_to_percentage(parseFloat(fair_odds));
    return 100 * Math.max(0, fair_percentage/100 - (1-fair_percentage/100)/fractional_odds);
  }
​
  expected_value = function(odds, fair_odds)
  {
    odds = parseFloat(odds);
    fair_odds = parseFloat(fair_odds);
    fair_percentage = odds_to_percentage(fair_odds);
    if(odds > 0)
    {
      return fair_percentage/100 * odds - 100*(1.0-fair_percentage/100);
    }
​
    return fair_percentage*-100/odds - 100*(1.0-fair_percentage/100);
  }
}
​
/* Devigging display methods */
{
  cells = function(book = null)
  {
    if(book)
    {
      return Array.from(document.querySelectorAll(`.ag-cell-value[col-id='${book}']`));
    }
    return Array.from(document.querySelectorAll(".ag-cell-value:not(div[col-id='subject']):not(div[col-id='bestOdds']):not(div[col-id='spread']):not(div[col-id='total'])"));
  }
​
  add_devigging_events = function()
  {
    for (cell of cells())
    {
      if(cell.onmouseover)
      {
        continue;
      }
​
      cell.onmouseover = add_devigged_odds_to_title;
      cell.oncontextmenu = add_to_parlay;
      cell.onclick = toggle_soft_line;
      cell.ondblclick = function(event){event.stopPropagation()};
    }
  }
​
  cells_for_row = function(row)
  {
    return row.childNodes;
  }
​
  row_for_cell = function(cell)
  {
    return cell.parentElement;
  }
​
  info_row_for_row = function(row)
  {
    row_index = row.getAttribute("row-index");
    return document.querySelector(`div[row-index="${row_index}"]`);
  }
​
  row_for_info_row = function(info_row)
  {
    row_index = info_row.getAttribute("row-index");
    return document.querySelectorAll(`div[row-index="${row_index}"]`)[1];
  }
​
  toggle_soft_line = function(event)
  {
    cell = event.currentTarget;
    if(row_for_cell(cell).getElementsByClassName(parlay_class).length || cell.textContent.trim() == "-" || cell.textContent.indexOf("%") != -1 || cell.textContent.trim() == "")
    {
      return;
    }
​
    if(event.currentTarget.classList.contains(soft_class))
    {
      make_row_normal(row_for_cell(cell));
    }
    else
    {
      make_cell_soft(cell);
      make_row_sharp(row_for_cell(cell));
    }
  }
​
  make_row_sharp = function(row)
  {
    soft_cell = row.querySelector(`.${soft_class}`);
    if(!soft_cell)
    {
      setTimeout(make_row_sharp, 100, row);
      return;
    }
    for(cell of cells_for_row(row))
    {
      if(cell.classList.contains(soft_class))
      {
        continue;
      }
​
      make_cell_sharp(cell, soft_cell);
    }
  }
​
  make_cell_sharp = function(cell, soft_cell)
  {
    if(cell.textContent.trim() == "-")
    {
      return;
    }
​
    soft_odds = parseInt(soft_cell.textContent);
    devigged_odds = devigged_odds_for_cell(cell);
​
    ev_bet = soft_odds > devigged_odds;
    background_color = ev_bet ? "LightGreen" : "LightPink";
​
    cell.classList.add(sharp_class);
    cell.firstElementChild.firstElementChild.firstElementChild.style.color = "Black";
    cell.firstElementChild.firstElementChild.firstElementChild.style.backgroundColor = background_color;
    add_ev_to_title(cell, soft_cell);
  }
​
  make_cell_soft = function(cell)
  {
    for(previous_soft_cell of row_for_cell(cell).getElementsByClassName(soft_class))
    {
      previous_soft_cell.classList.remove(soft_class);
    }
    cell.classList.add(soft_class);
    cell.firstElementChild.firstElementChild.firstElementChild.style.color = "Black";
    cell.firstElementChild.firstElementChild.firstElementChild.style.backgroundColor = "Yellow";
  }
​
  make_row_normal = function(row)
  {
    for(cell of cells_for_row(row))
    {
      make_cell_normal(cell);
    }
  }
​
  make_cell_normal = function(cell)
  {
    cell.classList.remove(soft_class);
    cell.classList.remove(sharp_class);
    cell.classList.remove(parlay_class);
    cell.firstElementChild.firstElementChild.firstElementChild.style.backgroundColor = "rgb(29, 39, 49)";
    cell.firstElementChild.firstElementChild.firstElementChild.style.color = "White";
    cell.removeAttribute("title");
  }
​
  parlay_legs = function()
  {
    return JSON.parse(localStorage.getItem(parlay_key)) || [];
  }
​
  add_devigged_odds_to_title = function(event)
  {
    cell = event.currentTarget;
    if(isNaN(parseFloat(cell.textContent)))
    {
      return;
    }
​
    devigged_odds = devigged_odds_for_cell(cell);
    devigged_percentage = devigged_percentage_string_for_cell(cell);
    if(!cell.title)
    {
      cell.title = `Fair: ${(devigged_odds)} (${devigged_percentage})`;
    }
  }
​
  add_ev_to_title = function(sharp_cell, soft_cell)
  {
    sharp_odds = devigged_odds_for_cell(sharp_cell);
    sharp_percentage = devigged_percentage_string_for_cell(sharp_cell);
    soft_odds = soft_cell.textContent;
    ev = expected_value(soft_odds, sharp_odds).toFixed(1) +"%";
    full_kelly_pct = kelly_percentage(soft_odds, sharp_odds).toFixed(1) + "%";
    full_kelly_bet = "$" + (bankroll*kelly_percentage(soft_odds, sharp_odds)/100).toFixed();
    fractional_kelly_bet = "$" + (bankroll*kelly_fraction*kelly_percentage(soft_odds, sharp_odds)/100).toFixed();
    fractional_kelly_pct = (kelly_fraction * kelly_percentage(soft_odds, sharp_odds)).toFixed(1) + "%";
​
    sharp_cell.title = `Fair: ${sharp_odds} (${sharp_percentage})\nEV: ${ev}\nFull Kelly: ${full_kelly_bet} (${full_kelly_pct})\nFractional Kelly: ${fractional_kelly_bet} (${fractional_kelly_pct})`;
  }
​
  devigged_percentage_for_cell = function(cell)
  {
    devigged_odds = devigged_odds_for_cell(cell);
    return odds_to_percentage(devigged_odds);
  }
​
  devigged_percentage_string_for_cell = function(cell)
  {
    return devigged_percentage_for_cell(cell).toFixed(1) + "%";
  }
​
  other_cells_for_cell = function(cell)
  {
    other_cells = [];
    book_cells = cells(cell.getAttribute("col-id"));
    for(book_cell of book_cells)
    {
      //if a cell has odds, add it to the array
      if(parseInt(book_cell.textContent) && book_cell.textContent.indexOf("%") < 0)
      {
        other_cells.push(book_cell);
      }
      //if the cell does not have odds but the cell is in the current array, return it
      else if(other_cells.indexOf(cell) != -1)
      {
        return other_cells;
      }
      //the cell does not have odds but the cell isn't in the current array, start over
      else
      {
        other_cells = [];
      }
    }
    return [cell];
  }
​
  devigged_odds_for_cell = function(cell)
  {
    other_cells = other_cells_for_cell(cell);
    //First basket should have 10 starters all mutually exclusive. If not, revert to one-way line
    if(dropdowns()[1].textContent.indexOf("First Basket") != -1)
    {
      other_cells = cells(cell.getAttribute("col-id")).filter(x=>x.textContent.trim() != "-");
      if(other_cells.length != 10)
      {
        other_cells = [cell];
      }
    }
    other_odds = other_cells.map(x=>x.textContent.trim());
    return devigged_power(other_odds)[other_cells.indexOf(cell)];
  }
}
​
/* Parlay functions */
{
  save_parlay_legs = function(legs)
  {
    localStorage.setItem(parlay_key, JSON.stringify(legs));
  }
​
  add_to_parlay = function(event)
  {
    cell = event.currentTarget;
​
    if(cell.textContent.trim() == "-" || cell.textContent.trim() == "" || cell.textContent.indexOf("%") != -1 || cell.classList.contains(sharp_class) || cell.classList.contains(soft_class))
    {
      return true;
    }
​
    legs = parlay_legs();
    legs.push(leg_from_cell(cell));
    save_parlay_legs(legs);
    make_cell_parlay(cell);
    return false;
  }
​
  make_cell_parlay = function(cell)
  {
    cell.oncontextmenu = remove_from_parlay;
    cell.classList.add(parlay_class);
    cell.firstElementChild.firstElementChild.firstElementChild.style.backgroundColor = "LightBlue";
    cell.firstElementChild.firstElementChild.firstElementChild.style.color = "Black";
    update_parlay_cell_titles();
  }
​
  market_dropdowns = function()
  {
    return Array.from(document.querySelectorAll(".mat-select")).map(x=>x.textContent.trim());
  }
​
  leg_from_cell = function(cell)
  {
    row = row_for_cell(cell);
    info_row = info_row_for_row(row);
    bet_info = Array.from(info_row.querySelectorAll("div.ag-cell:not(div[col-id='bestOdds']"));
    bet_strings = bet_info.map(x=>x.textContent.trim()).join(" ");
    devigged_odds = devigged_odds_for_cell(cell);
    devigged_percentage = devigged_percentage_for_cell(cell);
    book = cell.getAttribute("col-id");
    return ({market: market_dropdowns(), bet: bet_strings, odds: devigged_odds, percentage: devigged_percentage, book: book});
  }
​
  leg_equality = function(leg1, leg2)
  {
    return leg1.market.join() == leg2.market.join() && leg1.bet == leg2.bet && leg1.book == leg2.book;
  }
​
  update_parlay_cell_titles = function()
  {
    fair_percentage = 100;
    title_string = "";
    for(leg of parlay_legs())
    {
      market = leg.market[leg.market.length-1];
      if(leg.market.length > 2)
      {
        market = market + ` (${leg.market.slice(0, 2).join("/")})`;
      }
​
      title_string = title_string + `${market} - ${leg.bet} : ${leg.odds} (${parseFloat(leg.percentage).toFixed(1)}%)\n`;
      fair_percentage = fair_percentage * parseFloat(leg.percentage)/100;
    }
​
    fair_odds = percentage_to_odds(fair_percentage);
    title_string = title_string + `----------------------------\nFair odds: ${fair_odds} (${fair_percentage.toFixed(1)}%)`;
​
    for(cell of document.getElementsByClassName(parlay_class))
    {
      cell.title = title_string;
    }
  }
​
  remove_from_parlay = function(event)
  {
    cell = event.currentTarget;
​
    cell.oncontextmenu = add_to_parlay;
    make_cell_normal(event.currentTarget);
    legs = parlay_legs();
    leg = leg_from_cell(cell);
    legs = legs.filter(x => !leg_equality(leg, x));
    save_parlay_legs(legs);
    update_parlay_cell_titles();
​
    return false;
  }
​
  make_cells_parlay = function()
  {
    for(leg of parlay_legs())
    {
      book_cells = document.querySelectorAll(`div.ag-cell[col-id="${leg.book}"`);
      if(market_dropdowns().join() != leg.market.join())
      {
        continue;
      }
​
      for(cell of book_cells)
      {
        row = row_for_cell(cell);
        info_row = info_row_for_row(row);
​
        if(info_row.textContent.indexOf(leg.bet) != -1)
        {
          make_cell_parlay(cell);
          break;
        }
      }
    }
  }
​
  clear_parlay = function()
  {
    save_parlay_legs([]);
  }
}
​
/* On initial load */
{
  go_to_markets_events_id = setInterval(add_bet_finder_events, 100);
  check_for_autorefresh_id = setInterval(refresh_odds, 100);
  devigging_events_id = setInterval(add_devigging_events, 100);
  dim_rows_id = setInterval(dim_rows, 100);
  delete_old_data = setInterval(delete_old_data, 30000);
  make_cells_parlay_id = setInterval(make_cells_parlay, 100);
  load_league();
  clear_parlay();
}