// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: sports;

const userSettings = {
     leagueID: "",   //  "42", UCL// "77" WorldCup
    teamID2: "8634", //8256 Barca
    teamID: "10276", //10276
    //teamID: "10276", //Vasco
    //teamID2: "8256", //Brasil
    timeZone: "Asia/Jerusalem",
    timeDiff: 1,
    isLarge: true,
    nextGamesToShow: 4, //For league should be 3
    tablePositions: 5  //Usually 5
  }
  const baseApiUrl = encodeURI("https://www.fotmob.com");
  const inputStr = args.widgetParameter
  
  let fm = FileManager.local();
  const iCloudUsed = fm.isFileStoredIniCloud(module.filename);
  fm = iCloudUsed ? FileManager.iCloud() : fm;
  const widgetFolder = "WhatToWatch";
  const offlinePath = fm.joinPath(fm.documentsDirectory(), widgetFolder);
  if (!fm.fileExists(offlinePath)) fm.createDirectory(offlinePath);
  
  isRunLarge = userSettings.isLarge
  
  let textFont  = new Font("GillSans-SemiBold", 13)
  let titleFont  = new Font("GillSans-SemiBold", 13)
  let tableFont = new Font("GillSans-SemiBold", 12)
  
  // Run

  if (config.runsInWidget) {
      let widget = await createWidget();
      Script.setWidget(widget);
      Script.complete();
  } else {
      let widget = await createWidget();
      Script.complete();
      //chage from medium to large
      if ( isRunLarge ) {
          await widget.presentLarge();
      } else {
          await widget.presentMedium();
      }
  }

  
  // *** Functions *** //
  
  
  
  async function getData(url, cachedFileName) {
      let data;
      try {
          data = await new Request(url).loadJSON();
          //fm.writeString(fm.joinPath(offlinePath, cachedFileName), JSON.stringify(data));
      } catch (err) {
          console.log(`${err} Trying to read cached data: ${cachedFileName}`);
          try {
              if (iCloudUsed) await fm.downloadFileFromiCloud(fm.joinPath(offlinePath, cachedFileName));
              data = JSON.parse(fm.readString(fm.joinPath(offlinePath, cachedFileName)));
          } catch (err) {
              console.log(`${err}`);
          }
      }
      return data;
  }
  
  
  async function getNextMatches(searchID, isLeague, oneMatch){
      //if isLeague = false then return club games
      
      if (isLeague) {
          searchApiUrl = encodeURI(`${baseApiUrl}/api/leagues?id=${searchID}&tab=overview&type=team&timeZone=${userSettings.timeZone}`);
      } else {
          searchApiUrl = encodeURI(`${baseApiUrl}/api/teams?id=${searchID}&tab=overview&type=team&timeZone=${userSettings.timeZone}`);
      }
   
  
      const searchData = await getData(searchApiUrl, "searchData.json");
      if (isLeague) {
          matches = searchData.matches.data.allMatches;
      } else {
          matches = searchData.fixtures.allFixtures.fixtures;
      }
      if (oneMatch == true) { matchesToFetch = 1 } else { matchesToFetch = userSettings.nextGamesToShow }

      NextMatches = matches[0];
      //find the first matched not finished
      for (let i = 0; i < matches.length; i += 1) {
          if (matches[i].status.finished == false) {
              NextMatches = matches.slice(i,i + matchesToFetch);
              break; //stop on the first found
          }
  
      }
      //log(searchData)
  
      return NextMatches
  }
  
  
  async function getTable(teamId){
      
    searchApiUrl = encodeURI(`${baseApiUrl}/api/teams?id=${teamId}&tab=overview&type=team&timeZone=${userSettings.timeZone}`);
    const searchData = await getData(searchApiUrl, "searchData.json");
    // log(searchData)
    if (userSettings.teamID == "8256") {
        tableData = searchData.table[0].data.tables[6].table.all;
        tableTitle = searchData.table[0].data.tables[6].leagueName       
    } else {
    //This works for Brazilian league
    //tableData = searchData.table[0].data.table.all;
    //tableTitle = searchData.table[0].data.leagueName
    //This for Carioca
    tableData = searchData.table[0].data.tables[1].table.all;
    tableTitle = searchData.table[0].data.tables[1].leagueName  
    }

      // Get team position in league
      for (let i = 0; i < tableData.length; i += 1) {
          if (tableData[i].id == teamId) {
              //log("found" + i )
              teamPosition = i
                    log(`${i} ${teamPosition}`)
              break;
          }
      }
      let tableText = new Array(5)

      
      //for test
      //teamPosition = 19
  
      //show 6 positions: 4 before + team + 1 after
      if (( teamPosition-(userSettings.tablePositions -2)) < 0 ) {
          startPos = 0
      } else if (teamPosition == (tableData.length -1) ) { //-1 cause it starts from 0
              //check if last position 
              startPos = tableData.length - userSettings.tablePositions 
          } else {
              startPos = teamPosition-(userSettings.tablePositions -2)
          }
      
  
      let jj = 0
      for (let j = startPos; j < (startPos+userSettings.tablePositions) ; j += 1) {
          //tableText[jj] = `${tableData[j].idx}|${tableData[j].shortName.substring(0,3).toUpperCase()}|${tableData[j].played}|${tableData[j].pts}|${tableData[j].wins}|${tableData[j].goalConDiff}| `
          tableText[jj] = { 
              position: tableData[j].idx,
              team: tableData[j].shortName.substring(0,3).toUpperCase(),
              played: tableData[j].played,
              pts: tableData[j].pts,
              wins: tableData[j].wins,
              goalDif: tableData[j].goalConDiff
          }
          jj = jj+1
      }
  
      //Add here last 5 games
      historyMAtches = searchData.fixtures.allFixtures.fixtures
      
      for ( i = 0; i < (historyMAtches.length) ; i += 1) {
          if (historyMAtches[i].status.finished == false){
              //log(`match ${i-1} ${historyMAtches[i-1].pageUrl}`)
              break;
          }
      }
      //invese loop to get all last plays
      ii = 0
      historyGames = new Array(5)
      for ( j = (i-1); j > (i-6) ; j -= 1) {
          //log(`${ii} match ${j} ${historyMAtches[j].pageUrl} ${historyMAtches[j].home.score} x ${historyMAtches[j].away.score}`)
          homeScore = historyMAtches[j].home.score
          awayScore = historyMAtches[j].away.score
          if (homeScore == awayScore) {
              historyGames[ii] = Color.gray() //draw 
          } else if ( homeScore > awayScore) { // Home won
              if (historyMAtches[j].home.id == userSettings.teamID) { historyGames[ii] = Color.green()  } else {historyGames[ii] = Color.red()  } 
          } else if (historyMAtches[j].away.id == userSettings.teamID) { historyGames[ii] = Color.green()  } else {historyGames[ii] = Color.red()  } 
          ii +=1
      }
  
      const tableDataStr = {
          leagueName: tableTitle,
          teamPosition: teamPosition,
          rows: tableText,
          history: historyGames
      }
  
      return tableDataStr
  
  }
  
  
  function gameDetails(nextMatch, addTime) {
    //log(nextMatch)
    
    row1 = gameTeams(nextMatch.home.name , nextMatch.away.name, nextMatch.status.started)
    if (addTime == true) {
        rightTime = String(Number(nextMatch.status.startTimeStr.substring(0,2))+userSettings.timeDiff)+nextMatch.status.startTimeStr.substring(2,5)
    } else {rightTime = nextMatch.status.startTimeStr }
    log(nextMatch)
    log(nextMatch.status.utcTime)
    //row2 = `${nextMatch.status.startDateStrShort} at ${rightTime}`
    row2 = formatDate(new Date(nextMatch.status.utcTime))

    thisMatch = {
        row1: row1,
        row2: row2,
        team1: nextMatch.home.id,
        team2: nextMatch.away.id
        };
    return thisMatch;
  }
  
  
  
  // Create widget UI
  async function createWidget() {
    let widget = new ListWidget();
    //if (config.widgetFamily == "small") {isRunLarge = false} else {isRunLarge = true} //not working

    if ( inputStr != null ) {
        if (inputStr == 'false') {
            isRunLarge = false
        } else {
            if (inputStr == 'true') {
            isRunLarge = true
            } else {
            isRunLarge = userSettings.isLarge
            } 
        }
    } 
    else {    
        isRunLarge = userSettings.isLarge
    }
    log(inputStr)
    
    const generallStack = widget.addStack();
    generallStack.layoutHorizontally()
    
    const globalStack = generallStack.addStack();
    globalStack.layoutVertically()
    //globalStack.borderWidth = 10
    globalStack.addSpacer(15)

    race = await getF1Data()
    await addWidgetGame(globalStack, race, false);

    //Show teamID matches
    matchesToShow = await getNextMatches(userSettings.teamID,false, true)
    for (let i = 0; i < matchesToShow.length; i += 1) { 
       gameData = gameDetails(matchesToShow[i],false)
       await addWidgetGame(globalStack, gameData, false);
    }
    if (isRunLarge) {
        if (userSettings.leagueID == "" ) {
            //Show teamID matches straight after the first match
                matchesToShow = await getNextMatches(userSettings.teamID,false)
                for (let i = 1; i < matchesToShow.length; i += 1) {  //the first one is already displayed on top
                gameData = gameDetails(matchesToShow[i],false)
                await addWidgetGame(globalStack, gameData);
                }
        }
    }
    //Show teamID2 matches
    matchesToShow = await getNextMatches(userSettings.teamID2,false, true)
    for (let i = 0; i < matchesToShow.length; i += 1) { 
       gameData = gameDetails(matchesToShow[i],false)
       await addWidgetGame(globalStack, gameData, );
    }
    if (isRunLarge) {
        //Show league games
        if (userSettings.leagueID != "" ) {
            matchesToShow = await getNextMatches(userSettings.leagueID, true, false)
            for (let i = 0; i < matchesToShow.length; i += 1) {
                gameData = gameDetails(matchesToShow[i],true)
                await addWidgetGame(globalStack, gameData, true);
            }
        }
    }

    //Build Table
    tableToBuild = await getTable(userSettings.teamID)
    if (isRunLarge) { await addWidgetTable(globalStack, tableToBuild); }//generallStack instead of globalstack
     else { await addWidgetTable(generallStack, tableToBuild);} //generallStack instead of globalstack

  
  return widget;
  }

  async function addWidgetTable(globalStack, tableToBuild) {
      let picSize = 30;
      let hSpacing = 30;
      let vSpacing = 13;
  
      const stackTableArea = globalStack.addStack();
      stackTableArea.layoutHorizontally() //All area with tacle and picture ofteam

//stackTableArea.backgroundColor= Color.gray()
      
    if (isRunLarge) {
        const stackTable = stackTableArea.addStack(); //Table
    
        stackTable.layoutVertically();
        
        //Add leage title
        stackRowTitle = stackTable.addStack();
        stackRowTitle.addSpacer(5)
        //stackRowTitle.size = new Size(300 , vSpacing);
        addFormattedText(stackRowTitle, tableToBuild.leagueName, titleFont, null, null, null) 
    
        //Add first row
        stackRow = stackTable.addStack();
        stackRow.layoutHorizontally();
        stackRow.backgroundColor = Color.gray()
        addCellData(stackRow,"#", tableFont, Color.white(), null, "right", hSpacing,vSpacing)
        addCellData(stackRow,"Team", tableFont, Color.white(), null, "left", hSpacing*1.5,vSpacing) 
        addCellData(stackRow,"G", tableFont, Color.white(), null, "right", hSpacing,vSpacing) 
        addCellData(stackRow,"P", tableFont, Color.white(), null, "right", hSpacing,vSpacing) 
        addCellData(stackRow,"W", tableFont, Color.white(), null, "right", hSpacing,vSpacing) 
        //addCellData(stackRow,"Δ", tableFont, null, null, "right", hSpacing,vSpacing)  
            addCellData(stackRow,"GD", tableFont, Color.white(), null, "right", hSpacing*1.12,vSpacing)  
        
    
        for (let i = 0; i < (userSettings.tablePositions) ; i += 1) {
            //Add Row
            const stackRow = stackTable.addStack();
            stackRow.layoutHorizontally()
            if(i % 2!=0){
                stackRow.backgroundColor = new Color("#E8E8E8")
                rowFontColor = Color.black()
            } else {
                rowFontColor = null
            }
            //change the position to red text, the rest keep rowFontColor
            textTeamColor = null;
            if (i == tableToBuild.teamPosition) { rowFontColorTitle = Color.red() } else {rowFontColorTitle = rowFontColor}
            
            addCellData(stackRow,tableToBuild.rows[i].position, tableFont, rowFontColorTitle, null, "right", hSpacing,vSpacing)
            addCellData(stackRow,tableToBuild.rows[i].team, tableFont, rowFontColor, null, "left", hSpacing*1.5,vSpacing) 
            addCellData(stackRow,tableToBuild.rows[i].played, tableFont, rowFontColor, null, "right", hSpacing,vSpacing) 
            addCellData(stackRow,tableToBuild.rows[i].pts, tableFont, rowFontColor, null, "right", hSpacing,vSpacing) 
            addCellData(stackRow,tableToBuild.rows[i].wins, tableFont, rowFontColor, null, "right", hSpacing,vSpacing) 
            addCellData(stackRow,tableToBuild.rows[i].goalDif, tableFont, rowFontColor, null, "right", hSpacing,vSpacing)  
    
        }
        
        //Add Spacer aftert table
        stackRowSpace = stackTable.addStack();
        stackRowSpace = stackTable.addStack();
        stackRowSpace.layoutHorizontally();
        stackRowSpace.size = new Size(10,10);
    }
      
      const badgeAreaStack = stackTableArea.addStack()
      badgeAreaStack.addSpacer(10);    
      badgeAreaStack.layoutVertically()
      badgeAreaStack.size = new Size(90,100); // not in medium
      badgeAreaStack.addSpacer(10); // not in medium
      //Add picture of team
      const badgeStack = badgeAreaStack.addStack()
   
      let teamBadgeUrl = encodeURI(`https://images.fotmob.com/image_resources/logo/teamlogo/${userSettings.teamID}_small.png`);
      let teamBadgeOffline = `badge${userSettings.teamId}.png`;
      let teamBadgeValue = await getImage(teamBadgeUrl, teamBadgeOffline);
  
      let teamBadgeImage = badgeStack.addImage(teamBadgeValue);
      teamBadgeImage.imageSize = new Size(100, 70);
      addFormattedText(badgeStack, "", Font.regularSystemFont(12), null, null, false);
      badgeStack.centerAlignContent();
  
      //Add team history
      const historyStack = badgeAreaStack.addStack()
      for ( i = 4; i >= 0 ; i -= 1) {
          addCellData(historyStack,"●", textFont, tableToBuild.history[i], null, "right", 18,18) 
      }

    
  }
   
  function addCellData(stackRow,text, font, textColor, lineLimit, center, hSpacing,vSpacing){
      const cellStack = stackRow.addStack();
      cellStack.size = new Size(hSpacing, vSpacing);
      addFormattedText(cellStack, text, font, textColor, lineLimit, center) 
      cellStack.centerAlignContent();
  }
  
  function formatDate(date) {
  
      const options = { weekday: 'short', month: 'short', day: 'numeric', hour: "2-digit", minute: "numeric" };
  
      return date.toLocaleString("en-GB", options);
  
  }
  
  async function addWidgetGame(globalStack, nextMatch, showLeagueLogo) {
    let picSize = 27;
    const stackTeam = globalStack.addStack();
    
    stackTeam.layoutHorizontally()

    const stackPic = stackTeam.addStack();
    
    if (showLeagueLogo == true) {

        if (userSettings.leagueID == "77"){
            teamBadgeUrl=  "https://www.citypng.com/public/uploads/small/11649300098n16ia94khgdrs1ppillatxl5si55wr8nbs3skuz8rcohigpgs5skejhtddssbwqpd5p7dgm9khtzbfa7lniwl5tp2ip82dlamgnx.png"
        } else {  
            teamBadgeUrl = encodeURI(`https://images.fotmob.com/image_resources/logo/leaguelogo/${userSettings.leagueID}.png`);
        }
        
        const leagueBadgeOffline = `badge${userSettings.leagueID}.png`;
        //add third league pic
        let teamBadgeLeague = stackPic.addImage( await getImage(encodeURI(teamBadgeUrl), leagueBadgeOffline));
        teamBadgeLeague.imageSize = new Size( picSize, picSize)
        stackPic.addSpacer(10)
    }
    
    teamID = nextMatch.team1
        if (teamID == "F1") {
        teamBadgeUrl = encodeURI("https://www.formula1.com/etc/designs/fom-website/images/f1-logo-red.png")
        teamBadgeOffline = "f1-logo-red.png";
    } else if (parseInt(teamID)> 1000000){ //when there's no decision on the next game, for example Frace/England x Morroco/Portugal
        teamBadgeUrl = encodeURI(`https://img.favpng.com/21/11/8/vector-graphics-clip-art-football-ball-game-png-favpng-byXVF1R3jPP0vX2mQJc4ZwPp5.jpg`)
        teamBadgeOffline = `football.png`
    } else {
        teamBadgeUrl = encodeURI(`https://images.fotmob.com/image_resources/logo/teamlogo/${teamID}_small.png`);
        teamBadgeOffline = `badge${teamID}.png`;
    }
    
    let teamBadgeImage = stackPic.addImage( await getImage(encodeURI(teamBadgeUrl), teamBadgeOffline));
    teamBadgeImage.imageSize = new Size( picSize, picSize);

    const stackText = stackTeam.addStack();
    stackText.layoutVertically()
    
    addFormattedText(stackText, nextMatch.row1, textFont, null, null, null) 
    addFormattedText(stackText, nextMatch.row2, textFont, Color.gray(), null, null) 

    stackTeam.centerAlignContent();
    stackText.centerAlignContent();

    //add second pic
    stackPic.addSpacer(5)
    if (parseInt(nextMatch.team2)> 1000000){ //when there's no decision on the next game, for example Frace/England x Morroco/Portugal
        teamBadgeUrl2 = encodeURI(`https://img.favpng.com/21/11/8/vector-graphics-clip-art-football-ball-game-png-favpng-byXVF1R3jPP0vX2mQJc4ZwPp5.jpg`)
        teamBadgeOffline2 = `football.png`
    } else { 
        teamBadgeUrl2 = encodeURI(`https://images.fotmob.com/image_resources/logo/teamlogo/${nextMatch.team2}_small.png`)
        teamBadgeOffline2 = `badge${nextMatch.team2}.png`
    }
    let teamBadgeImage2 = stackPic.addImage( await getImage(teamBadgeUrl2), teamBadgeOffline2);
    teamBadgeImage2.imageSize = new Size( picSize, picSize)
    
    globalStack.addSpacer(3)
  }
  
  async function getF1Data(){

    todayDate = new Date()

    let thisYear = todayDate.getFullYear()

    let lastRaceYear = '2022-11-19' // Should move this to be generic after reading JSON
    if ((thisYear == 2022) && ( todayDate > new Date(lastRaceYear))){ thisYear += 1  }

    //change to get generic year
    vURL = `https://raw.githubusercontent.com/sportstimes/f1/main/_db/f1/${thisYear}.json`

    racesJSON = await new Request(vURL).loadJSON();
    

    for (var i in racesJSON.races) {

        GPDate    = new Date(racesJSON.races[i].sessions.gp)

        if ( todayDate <= GPDate ) {
            
            let thisGP = {
                row1: `${racesJSON.races[i].name} - ${racesJSON.races[i].location}`,
                row2: formatDate(GPDate),
                team1: "F1",
                team2: await getFlagID(racesJSON.races[i].name) 
                        };
            return thisGP;
        }


    }
    return thisGP;
    
  }

async function getFlagID(location) {
    //Change to send the right flags late
    racesID = {
        "Bahrain":{"raceID": "5901"},
        "Saudi Arabian":{"raceID": "7795"},
        "Australian":{"raceID": "6716"},
        "Emilia Romagna Grand Prix":{"raceID": "8204"},
        "Miami":{"raceID": "6713"},
        "Spanish":{"raceID": "6720"},
        "Monaco":{"raceID": "9829"},
        "Azerbaijan":{"raceID": "8566"},
        "Canadian":{"raceID": "5810"},
        "British": {"raceID":"8491"},
        "Austrian":{"raceID": "8255"},
        "French":{"raceID": "6723"},
        "Hungarian":{"raceID": "8565"},
        "Belgian":{"raceID": "8263"},
        "Dutch":{"raceID": "6708"},
        "Italian":{"raceID": "8204"},
        "Singapore":{"raceID": "5825"},
        "Japanese": {"raceID":"6715"},
        "United States": {"raceID":"6713"},
        "Mexican": {"raceID":"6710"},
        "Brazilian":{"raceID": "8256"},
        "Abu Dhabi": {"raceID":"5789"},
        }
return racesID[location].raceID
}

  
  
  // Generic Functions
  
  async function getImage(url, cachedFileName) {
      let image;
      try {
          image = await new Request(url).loadImage();
          //fm.writeImage(fm.joinPath(offlinePath, cachedFileName), image);
      } catch (err) {
          console.log(`${err} Trying to read cached data: ${cachedFileName}`);
          try {
              if (iCloudUsed) await fm.downloadFileFromiCloud(fm.joinPath(offlinePath, cachedFileName));
              image = fm.readImage(fm.joinPath(offlinePath, cachedFileName));
          } catch (err) {
              console.log(`${err}`);
          }
      }
      return image;
  }
  
  async function getData(url, cachedFileName) {
      let data;
      try {
          data = await new Request(url).loadJSON();
          //fm.writeString(fm.joinPath(offlinePath, cachedFileName), JSON.stringify(data));
      } catch (err) {
          console.log(`${err} Trying to read cached data: ${cachedFileName}`);
          try {
              if (iCloudUsed) await fm.downloadFileFromiCloud(fm.joinPath(offlinePath, cachedFileName));
              data = JSON.parse(fm.readString(fm.joinPath(offlinePath, cachedFileName)));
          } catch (err) {
              console.log(`${err}`);
          }
      }
      return data;
  }
  
  
  function addFormattedText(stack, string, font, textColor, lineLimit, center) {
     //log(string)
      let maxLen = 50
      if (string.length < maxLen) {
          toAdd =  Math.floor((maxLen - string.length ) )
          string = string + ' '.repeat(toAdd);
      }
     
      string = ' '.repeat(2) + string
      const textAdded = stack.addText(string);
      //log("-"+string+'-"')
      textAdded.font = font;
      if (lineLimit) textAdded.lineLimit = lineLimit;
      if (textColor) textAdded.textColor = textColor;
      if (center) textAdded.centerAlignText();
  
  }
  
  function gameTeams(homeTeam, awayTeam, isStarted) {
      //Vasco da Gama X Sampaio Co
      //1234567890123456789012345
      if (isStarted) { 
          score =  ` ${nextMatch.home.score} X ${nextMatch.away.score} `
      } else {
          score =  " X "
      }
      //log(score)
      rowText = homeTeam + score + awayTeam
      if ( rowText.length > 25 ) {
          if (homeTeam == 'Vasco da Gama') {
              homeTeam = 'Vasco'
          } else { if (awayTeam == 'Vasco da Gama'){
              awayTeam = 'Vasco'
          }
          }
      }
      rowText = homeTeam + score + awayTeam
      if (( rowText.length > 25 ) && (homeTeam.indexOf(' ')>=0)) {    
          if (homeTeam == 'Vasco') {
              awayTeam = `${awayTeam.substring(0,1)}. ${awayTeam.substring(awayTeam.indexOf(' ')+1)}` 
          } else {
              homeTeam = `${homeTeam.substring(0,1)}.  ${homeTeam.substring(homeTeam.indexOf(' ')+1)}` 
          }       
      }
      fullText = `${homeTeam}${score}${awayTeam}` 
      return fullText
  }
  
  