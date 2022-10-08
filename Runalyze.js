// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic;



// Function to bring data to widget
     var getData = `
         function getData(){
            const source = document.getElementById("panel-467392")
            x = source.innerText;
            return x
          }

         getData()
    `

// getImage
async function getImage(image, vImageURL) {
  let fm = FileManager.iCloud()
  let dir = fm.documentsDirectory() 
  if ( fm.isDirectory(dir) == false) {
    fm.createDirectory(dir, true)
  }
  
  let path = fm.joinPath(dir, image)
  if(fm.fileExists(path)) {
    log('here '+path)
    await fm.downloadFileFromiCloud(path)
    return fm.readImage(path)
  } else {
    log('download once ' + vImageURL + ' path ' + path )
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

function addFormattedText(stack, string, font, textColor, lineLimit, center) {
    const text = stack.addText(string);
    text.font = font;
    if (lineLimit) text.lineLimit = lineLimit;
    if (textColor) text.textColor = textColor;
    if (center) text.centerAlignText();
}

function addFormattedText2Stack(stackLeft,stackRight, stringLeft,stringRight, font, textColor, lineLimit, center) {
    const text = stackLeft.addText(stringLeft);
    text.font = font;
    if (lineLimit) text.lineLimit = lineLimit;
    if (textColor) text.textColor = textColor;
    if (center) text.centerAlignText();
    
    const textRight = stackRight.addText(stringRight);
    textRight.font = font;
    if (lineLimit) textRight.lineLimit = lineLimit;
    if (textColor) textRight.textColor = textColor;
    if (center) textRight.centerAlignText();
}


function buildWidgets(strData){
      let mainText = new Font("GillSans-SemiBold", 14)
      
      
      // image "https://c4.runalyze.com/assets/images/runalyze-swoosh.png"

      const results = strData.split(/\r?\n/);
      log(results)
     

      let widgetLeftStack  = dataStack.addStack()
      widgetLeftStack.layoutVertically()

      let widgetRightStack  = dataStack.addStack()
      widgetRightStack.layoutVertically()


      //widgetMainStack.addText(response2)
      //Adding Titles
      //starting from 1 cuase 0 is "RESULTS"
      
  /*
  0 "CALCULATIONS ",
  1 "Effective VO2max\t","36,92",
  3 "Marathon Shape\t","5 %",
  5 "Fatigue (ATL)\t","20",
  7"Fitness (CTL)\t","14",
  9 "Stress Balance (TSB)\t","-30 %",
  11"Workload Ratio (A:C)\t","1,43",
  13"Rest days\t","1,5",
  15"Monotony\t","0,69",
  17 "Training strain\t","108",""]
  */    
      
      let VOMaxText =  results[1]
      let VOMax = results[2]
      let marathonText =  results[3]
      let marathon = results[4]
      let restText =  results[13]
      let rest = results[14]
      let stressText = results[9]
      let stress = results[10]           
      
            
      addFormattedText2Stack( widgetLeftStack, widgetRightStack, VOMaxText   ,VOMax,   mainText, Color.black(), null, false);
      addFormattedText2Stack( widgetLeftStack, widgetRightStack, restText    ,rest,    mainText, Color.black(), null, false);
      addFormattedText2Stack( widgetLeftStack, widgetRightStack, marathonText,marathon,mainText, Color.black(), null, false);
      addFormattedText2Stack( widgetLeftStack, widgetRightStack, stressText  ,stress,  mainText, Color.black(), null, false);
            
      //addFormattedText(widgetLeftStack, restText, mainText, Color.black(), null, false);
           
      widget.presentMedium()
}



////////////////////////////////////////////////////

/*
url = "https://runalyze.com/logout"
let webviewLogout = new WebView()
await webviewLogout.loadURL(url)
log('after log out')
*/


let inputString = args.widgetParameter
if ( inputString == null ) { inputString = "username#password" }
var inputArgs = inputString.split("#")
let strUsername = inputArgs[0]
let strPassword = inputArgs[1]

      var loginScript = `

        function submitForm(vform) {
          const submitFormFunction = Object.getPrototypeOf(vform).submit;
          submitFormFunction.call(vform);
        }
                  
        function logInSite(){


        let form = document.forms[0];
 
        form.elements['username'].value = '${strUsername}';
        form.elements['password'].value = '${strPassword}';
 
        a = form.elements['username'].value + ' - ' + form.elements['password'].value + ' - ' + form.className;
        
        submitForm(form);

        //HTMLFormElement.prototype.submit.call(form);
        //document.createElement('form').submit.call(form)
        

        return a

         }

        logInSite()
   `



log (strUsername +' ' + strPassword)

url = "https://runalyze.com/dashboard"

let webview = new WebView()
await webview.loadURL(url)


let html = await webview.getHTML();
//log(html)


if (html.includes('container-auth')){
    log('do login')
    let response = await webview.evaluateJavaScript(loginScript, true)
    log(response)
     } else {
    log('already logged in')
  }


  response = await webview.evaluateJavaScript(getData, false)
  //log(response)

  let widget = new ListWidget()

  let widgetMainStack = widget.addStack()
   widget.backgroundColor = Color.white()
   widgetMainStack.layoutVertically()
   widgetMainStack.centerAlignContent()
      
  let logoStack  = widgetMainStack.addStack(); 
  let dataStack  = widgetMainStack.addStack(); 
      
  let logoImg = await getImage("runalyze-swoosh.png", "https://c4.runalyze.com/assets/images/runalyze-swoosh.png")
  let theLogo = logoStack.addImage(logoImg)
      
  buildWidgets(response)
  Script.complete()
