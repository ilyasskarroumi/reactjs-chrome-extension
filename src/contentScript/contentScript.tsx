chrome.runtime.sendMessage('I am loading content script', (response) => {
    const htmlContent = document.documentElement.outerHTML;
    const regex = /{key:\s*'ds:6'([\s\S]*?)sideChannel:\s*{}}/g;
    
    var extractedObject = null;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(htmlContent)) !== null) {
        const extractedString = match[0];
        const jsonString = extractedString
            .replace(/key:\s*'ds:6',?/, '') // Remove key: 'ds:6'
            .replace(/hash:\s*'[^']*',?/, '') // Remove hash: '...'
            .replace(/,\s*sideChannel:\s*{},?/, '') // Remove sideChannel: {}
            .replace(/data:/, '"data":'); // Replace data with "data"
        try {
            extractedObject = JSON.parse(jsonString);
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    }
    if(extractedObject) {
        const targetDiv = document.querySelector('div.tU8Y5c');
        const container = document.createElement('div');
        const card1 = createCard('App Age', extractedObject.data[1][2][10][0]);
        const card2 = createCard('Installs', extractedObject.data[1][2][13][2]);
        const card3 = createCard('Short Description', extractedObject.data[1][2][73][0][1]);
        const card4 = createCard('Category', extractedObject.data[1][2][79][0][0][0]);
        const content = document.getElementById('content');
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);
        const id = searchParams.get("id");
        const button1 = createButton("Open in MobiOption", "https://beta.mobioptions.com/details?id=" + id)
        const button2 = createButton("Open in AppBrain", "https://www.appbrain.com/app/" + id)
        const button3 = createButton("Download APK", "https://d.apkpure.com/b/APK/" + id + "?version=latest")
        container.append(card1)
        container.append(card2)
        container.append(card3)
        container.append(card4)
        container.append(button1)
        container.append(button2)
        container.append(button3)
        targetDiv.innerHTML += found()

        // targetDiv.insertBefore(container, targetDiv.firstChild.nextSibling);
    }
})

function createCard(title: string, number: string): HTMLElement {
    const card = document.createElement('div');
    card.className = 'render-card';
  
    const cardContent = document.createElement('div');
    cardContent.className = 'rendercard-content';
  
    const heading = document.createElement('h3');
    heading.textContent = title;
    heading.className = "render-title";
  
    const paragraph = document.createElement('p');
    paragraph.textContent = number;
    paragraph.className = 'render-number';
  
    cardContent.appendChild(heading);
    cardContent.appendChild(paragraph);
  
    card.appendChild(cardContent);
  
    return card;
}

function createButton(label: string, url: string): HTMLElement {
    // Create a button element
  const button = document.createElement('button');
  button.textContent = label;

  // Create an anchor element
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.appendChild(button);
  
  return link
}

window.onload = (event) => {
    var pageTitle = document.title;
    const content = document.getElementById('content');
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
    const id = searchParams.get("id");
    if(pageTitle == "Not Found") {
        content.innerHTML += notFound(id)
    }
    else {
        const htmlContent = document.documentElement.outerHTML;
        const regex = /{key:\s*'ds:6'([\s\S]*?)sideChannel:\s*{}}/g;
        
        var extractedObject = null;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(htmlContent)) !== null) {
            const extractedString = match[0];
            const jsonString = extractedString
                .replace(/key:\s*'ds:6',?/, '') // Remove key: 'ds:6'
                .replace(/hash:\s*'[^']*',?/, '') // Remove hash: '...'
                .replace(/,\s*sideChannel:\s*{},?/, '') // Remove sideChannel: {}
                .replace(/data:/, '"data":'); // Replace data with "data"
            try {
                extractedObject = JSON.parse(jsonString);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        }
    }
};

function notFound(id) {
    return `
        <div style="color: rgb(102, 102, 102); font-weight: bold; display: flex; justify-content: center; align-items: center; border-width: 1px; border-style: solid; border-color: rgb(161, 180, 217); border-image: initial; padding: 12px 0px;">
            <a style="display: flex; color: rgb(102, 102, 102); text-decoration: none;" href="https://beta.mobioptions.com/details?id=${id}" target="_blank">
                <img width="200px" src="https://beta.mobioptions.com/static/media/argon-react.145d77702522ea432b33.png">
                <p>Check this app meta data has been stored at MobiOptions</p>
            </a>
        </div>
    `
}

function found() {
    return `
        <div style="box-sizing: border-box; display: flex; flex-flow: row wrap; margin-top: -16px; width: calc(100% + 16px); margin-left: -16px; -webkit-box-pack: center; justify-content: center;">
            <div style="padding-left: 16px; padding-top: 16px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 4px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                        <div style="padding: 10px; background-color: rgb(3, 157, 247); text-align: center;">
                            <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-6flbmm" style="user-select: none; width: 1em; height: 1em; display: inline-block; fill: currentcolor; flex-shrink: 0; transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; font-size: 2.1875rem;" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DownloadOutlinedIcon">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z"></path>
                            </svg>
                        </div>
                    </div>
                    <div style="color: rgb(238, 238, 238); font-size: 16px;padding: 16px;">1B+</div>
                    <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                    <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Installs</div>
                </div>
            </div>
            <div style="padding-left: 16px; padding-top: 16px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 4px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                        <div style="padding: 10px; background-color: rgb(3, 157, 247); text-align: center;">
                            <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-6flbmm" style="user-select: none; width: 1em; height: 1em; display: inline-block; fill: currentcolor; flex-shrink: 0; transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; font-size: 2.1875rem;" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DownloadOutlinedIcon">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z"></path>
                            </svg>
                        </div>
                    </div>
                    <div style="color: rgb(238, 238, 238); font-size: 16px;padding: 16px;">1B+</div>
                    <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                    <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Installs</div>
                </div>
            </div>
            <div style="padding-left: 16px; padding-top: 16px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 4px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                        <div style="padding: 10px; background-color: rgb(3, 157, 247); text-align: center;">
                            <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-6flbmm" style="user-select: none; width: 1em; height: 1em; display: inline-block; fill: currentcolor; flex-shrink: 0; transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; font-size: 2.1875rem;" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DownloadOutlinedIcon">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z"></path>
                            </svg>
                        </div>
                    </div>
                    <div style="color: rgb(238, 238, 238); font-size: 16px;padding: 16px;">1B+</div>
                    <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                    <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Installs</div>
                </div>
            </div>
            <div style="padding-left: 16px; padding-top: 16px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 4px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                </div>
            </div>
            <div style="padding-left: 16px; padding-top: 16px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 4px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                        <div style="padding: 10px; background-color: rgb(3, 157, 247); text-align: center;">
                            <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-6flbmm" style="user-select: none; width: 1em; height: 1em; display: inline-block; fill: currentcolor; flex-shrink: 0; transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; font-size: 2.1875rem;" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DownloadOutlinedIcon">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z"></path>
                            </svg>
                        </div>
                    </div>
                    <div style="color: rgb(238, 238, 238); font-size: 16px;padding: 16px;">1B+</div>
                    <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                    <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Installs</div>
                </div>
            </div>
            <div style="padding-left: 16px; padding-top: 16px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 4px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                        <div style="padding: 10px; background-color: rgb(3, 157, 247); text-align: center;">
                            <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-6flbmm" style="user-select: none; width: 1em; height: 1em; display: inline-block; fill: currentcolor; flex-shrink: 0; transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; font-size: 2.1875rem;" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DownloadOutlinedIcon">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z"></path>
                            </svg>
                        </div>
                    </div>
                    <div style="color: rgb(238, 238, 238); font-size: 16px;padding: 16px;">1B+</div>
                    <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                    <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Installs</div>
                </div>
            </div>
            <div style="padding-left: 16px; padding-top: 16px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 4px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                        <div style="padding: 10px; background-color: rgb(3, 157, 247); text-align: center;">
                            <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-6flbmm" style="user-select: none; width: 1em; height: 1em; display: inline-block; fill: currentcolor; flex-shrink: 0; transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; font-size: 2.1875rem;" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DownloadOutlinedIcon">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z"></path>
                            </svg>
                        </div>
                    </div>
                    <div style="color: rgb(238, 238, 238); font-size: 16px;padding: 16px;">1B+</div>
                    <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                    <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Installs</div>
                </div>
            </div>
        </div>
    `
}