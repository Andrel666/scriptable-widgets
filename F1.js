// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: magic;

//Based on: https://github.com/Andrel666/ScriptStore/tree/main/Widgets/F1

vDate = returnToday()
//
// let vYear = new Date().getFullYear()
//
 vDate = vDate ? vDate : vDate = Epoch(new Date())

log(vDate)


 let vYear = EpochToDate(vDate).getFullYear()

if ((vYear == 2022) && ( vDate > Epoch(new Date('2022-11-21')))){
  vYear = 2023
}


let selectedTheme =  "default"
//
// vURL = "https://raw.githubusercontent.com/sportstimes/f1/main/_db/f1/" + vYear +".json"//

//   vURL = "https://raw.githubusercontent.com/Andrel666/ScriptStore/main/Widgets/F1/2022.JSON"

let fm = FileManager.iCloud()
log(fm.documentsDirectory() + "/tracks/" + vYear + ".JSON")

// change to get from folder, works here bit not on widget
 vURL =   fm.documentsDirectory() + "/tracks/" + vYear + ".JSON"
let text = fm.read(vURL)
let rawString = text.toRawString()
let jg = JSON.parse(rawString);


let mainText = new Font("GillSans-SemiBold", 14)
let titleTextFont = new Font("GillSans-SemiBold", 18)
Theme = getTheme(selectedTheme)

// let jg = await getJson(vURL)

//vDate = vDate || Epoch(new Date())//

//log(vDate)


for (var key in jg.races) {
  vGP         = jg.races[key].sessions.gp
  vGPepoch    = Epoch(vGP)

  if ( vDate <= vGPepoch ) {
    vLoc        = jg.races[key].location
    vSlug       = jg.races[key].slug
//     vlocaleKey  = jg.races[key].localeKey
    vName       = jg.races[key].name
    vImage      = "./tracks/" + vLoc + ".png"
log(vLoc)
    vFlag       = getFlag(vLoc)
//     vTBC        = jg.races[key].tbc
    vRnd        = jg.races[key].round
//     vLong       = jg.races[key].longitude
//     vLat        = jg.races[key].latitude
//     vAff        = jg.races[key].affiliate
//     vFP1        = Epoch(jg.races[key].sessions.fp1)
//     vFP2        = Epoch(jg.races[key].sessions.fp2)
//     vFP3        = Epoch(jg.races[key].sessions.fp3)
//     vQuali      = Epoch(jg.races[key].sessions.qualifying)
    vSprint     = Epoch(jg.races[key].sessions.sprint)

    if (vSprint > vDate) {
       next = "Sprint " + returnDateSnippet(vSprint)
      } else {
        next = ""
    }

    break
  }

}

let widget = new ListWidget()
widget.backgroundColor = rC(Theme.vBackground)

//Repace space with %20
vName = vName.replace(" ","%20")

log("vLoc = " + vLoc)
log("vName = " + vName)

let titleTrack = await getImage(vLoc + ".png", "https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/" + vName + ".png")


let trackWidth = 120
let trackHeight = (titleTrack.size.height / titleTrack.size.width) * trackWidth


let widgetMainStack = widget.addStack()
widgetMainStack.layoutVertically()
widgetMainStack.centerAlignContent()

widgetMainStack.size = new Size(350, 160)
  // widgetMainStack.setPadding(50, 0, 40, 0)
widgetMainStack.borderColor = rC(Theme.vBorder)
//Remove Broder
//widgetMainStack.borderWidth = 6
//widgetMainStack.cornerRadius = 20
//widgetMainStack.backgroundColor = rC(Theme.vBackground)

let widgetTitle = widgetMainStack.addStack()
widgetTitle.size = new Size(350, 30)

//let flagTmp = await getImage(vName + ".png","https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/" + vName + "-flag.png.transform/9col/image.png")
//log("https://www.formula1.com/content/dam/fom-website/2018-redesign-assets/Flags%2016x9/" + vName.toLowerCase() + "-flag.png.transform/9col/image.png")

theTitle = widgetTitle.addText("  " + vFlag + " " + toUpper(vSlug, '-', ' '))
theTitle.centerAlignText()
theTitle.font = titleTextFont
theTitle.textColor = rC(Theme.vTitle)


let widgetRest = widgetMainStack.addStack()

let widgetLeftStack  = widgetRest.addStack()
widgetLeftStack.layoutVertically()

let widgetLeftTitleStack   = widgetLeftStack.addStack()
widgetLeftTitleStack.layoutVertically()

//Left Details Stack
let widgetLeftDetailsStack = widgetLeftStack.addStack()
widgetLeftDetailsStack.layoutVertically()

widgetLeftDetailsStack.setPadding(0, 30, 0, 0)
theDetailSub = widgetLeftDetailsStack.addText(vLoc)
theDetailSub.font = titleTextFont
theDetailSub.textColor = rC(Theme.vTitle)

//emptyRow = widgetLeftDetailsStack.addText("  ")

var options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
dateGP = new Date(vGP);
log("vGP " + dateGP.toLocaleDateString("en-GB",options) )

theDetailRaceDate = widgetLeftDetailsStack.addText( dateGP.toLocaleDateString("en-GB",options) )
theDetailRaceDate.font = mainText
theDetailRaceDate.textColor = rC(Theme.vDetails)

theDetailRace = widgetLeftDetailsStack.addText("Race " + returnDateSnippet(vGPepoch))
theDetailRace.font = mainText
theDetailRace.textColor = rC(Theme.vDetails)

//This needs calculating to show the next Sprint
theDetailSprint = widgetLeftDetailsStack.addText(next)
theDetailSprint.font = mainText
theDetailSprint.textColor = rC(Theme.vDetails)

// Add widget and track Image
let widgetRightStack = widgetRest.addStack()
theLogo = widgetRightStack.addImage(titleTrack)
theLogo.imageSize = new Size(trackWidth, trackHeight)


widget.presentMedium()


// ---------  FUNCTIONS only here ------------

function returnToday(){
// Add inputStr to test
let inputStr = args.widgetParameter//
//      inputStr  = '2023-11-15';

if ( inputStr == null ) {
  vDate = Epoch(Date.now())
} else {
  let dateTest = new Date(inputStr);
  log ("dateTest " + dateTest)
  vDate = Epoch(dateTest)
}

return vDate
}


function returnDateSnippet(sesh) {
  daysToGo  = Math.floor(((sesh - vDate) / 60 / 60 / 24 ))
  hoursToGo = Math.floor((sesh - vDate - (daysToGo * 24 * 60 * 60) ) / 60 / 60)
  if (daysToGo > 0){
    return ": in " +  daysToGo + " days" //+ hoursToGo + " hours."
  } else {
    return ": in " + hoursToGo + " hours."
  }

}

function rC(hex) { return new Color(hex) }

function toUpper(str, delim, joinDelim) {
return str
    .toLowerCase()
    .split(delim)
    .map(function(word) {
        return word[0].toUpperCase() + word.substr(1);
    })
    .join(joinDelim);
 }

async function getJson(urlName) {
  let fReq = new Request(urlName)
  let output = await fReq.loadJSON()
  return output
}

//Epoch
function Epoch(date) {
    return Math.round(new Date(date).getTime() / 1000.0);
}

//Epoch To Date
function EpochToDate(epoch) {
    if (epoch < 10000000000)
        epoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
    var epoch = epoch + (new Date().getTimezoneOffset() * -1); //for timeZone
    return new Date(epoch);
}

// get images from local filestore or download them once
async function getImage(image, vImageURL) {
  let fm = FileManager.iCloud()
  let dir = fm.documentsDirectory() + "/tracks/"
  if ( fm.isDirectory(dir) == false) {
    fm.createDirectory(dir, true)
  }

  let path = fm.joinPath(dir, image)
  if(fm.fileExists(path)) {
    await fm.downloadFileFromiCloud(path)
    return fm.readImage(path)
  } else {
    // download once
    let iconImage = await loadImage(vImageURL)
    fm.writeImage(path, iconImage)
    return iconImage
  }
}


// helper function to download an image from a given url
async function loadImage(imgUrl) {
    const req = new Request(imgUrl)
    return await req.loadImage()
}



function getTheme(themeName) {

  themes= {
  "default":  {
    "vBackground"   : "#000000", "_c1": "Black",
    "vTitle"        : "#FF1801", "_c2": "Red",
    "vDetails"      : "#ffffff", "_c3": "White",
    "vTrack"        : "#ffffff", "_c4": "White",
    "vBorder"       : "#000000", "_c5": "Black",
    "vTBC"          : "#000000", "_c6": "black"
  }
}
  return themes[themeName]
}


function getFlag(loc) {
    flags = {
      "Sakhir":            {"flag": "🇧🇭"},
      "Imola":             {"flag": "🇮🇹"},
      "TBC":               {"flag": "🏴‍☠️"},
      "Catalunya":         {"flag": "🇪🇸"},
      "Monte Carlo":       {"flag": "🇲🇨"},
      "Baku":              {"flag": "🇦🇿"},
      "Montreal":          {"flag": "🇨🇦"},
      "Paul Ricard":       {"flag": "🇫🇷"},
      "Spielberg":         {"flag": "🇦🇹"},
      "Silverstone":       {"flag": "🇬🇧"},
      "Budapest":          {"flag": "🇭🇺"},
      "Spa-Francorchamps": {"flag": "🇧🇪"},
      "Zandvoort":         {"flag": "🇳🇱"},
      "Monza":             {"flag": "🇮🇹"},
      "Sochi":             {"flag": "🇷🇺"},
      "Singapore":         {"flag": "🇸🇬"},
      "Suzuka":            {"flag": "🇯🇵"},
      "Austin":            {"flag": "🇺🇸"},
      "Mexico City":       {"flag": "🇲🇽"},
      "Sao Paulo":         {"flag": "🇧🇷"},
      "Melbourne":         {"flag": "🇦🇺"},
      "Jeddah":            {"flag": "🇸🇦"},
      "Yas Marina":        {"flag": "🇦🇪"},
      "Pre Season Test":   {"flag": "🇧🇭"},
      "Las Vegas":         {"flag": "🇺🇸"},
      "Shanghai":             {"flag": "🇨🇳"},
      "Losail":             {"flag": "🇶🇦"},
   }
    return flags[loc].flag
}
