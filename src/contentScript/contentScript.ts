chrome.runtime.sendMessage('I am loading content script', (response) => {
    var pageTitle = document.title;
    if(pageTitle == "Not Found") {
        const content = document.getElementById('content');
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);
        const id = searchParams.get("id");
        const section = `<div class="error-page-wr"><a class="error-page-link" href="https://beta.mobioptions.com/details?id=${id}" target="_blank"><img width="200px" src="https://beta.mobioptions.com/static/media/argon-react.145d77702522ea432b33.png"><p>Check this app meta data has been stored at MobiOptions</p></a></div>`
        content.innerHTML += section
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

            targetDiv.insertBefore(container, targetDiv.firstChild.nextSibling);
        }
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
    if(pageTitle == "Not Found") {
        const content = document.getElementById('content');
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);
        const id = searchParams.get("id");
        const section = `<div class="error-page-wr"><a class="error-page-link" href="https://beta.mobioptions.com/details?id=${id}" target="_blank"><img width="200px" src="https://beta.mobioptions.com/static/media/argon-react.145d77702522ea432b33.png"><p>Check this app meta data has been stored at MobiOptions</p></a></div>`
        content.innerHTML += section
    }
    else {
        // console.log("----------");
        // console.log(json.hash);
        // console.log("----------");
    }
};
