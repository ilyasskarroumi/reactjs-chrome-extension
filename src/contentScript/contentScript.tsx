chrome.runtime.sendMessage('I am loading content script', (response) => {
    let current_app_url = location.href;
    setInterval(function () {
        if (current_app_url != location.href) {
            location.reload();
        }
    }, 500);
    
    if(location.href.startsWith('https://play.google.com/store/apps/details')){
        const content = document.getElementById('content');
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);
        const id = searchParams.get("id");
        if(content) {
            if(id && id !== '')
                content.innerHTML += notFound(id)
        }
        else {
            const htmlContent = document.documentElement.outerHTML;
            const regex = /{key:\s*'ds:\d+'([\s\S]*?)sideChannel:\s*{}}/g;
            var extractedObject = null;
            let match: RegExpExecArray | null;
            let shouldBreak = false;
            var age = 'N/A';
            var installs = 'N/A';
            var category = 'N/A';
            var short = 'N/A';
            var name = '';
            while ((match = regex.exec(htmlContent)) !== null) {
                for (let i = 0; i < match.length; i++) {
                    try {
                        extractedObject = JSON.parse(match[i].replace(/key:\s*'ds:\d+',?/, '').replace(/hash:\s*'[^']*',?/, '').replace(/,\s*sideChannel:\s*{},?/, '').replace(/data:/, '"data":'));
                        try {
                            name = extractedObject.data[1][2][0][0] || '';
                        } catch (error) {}
                        try {
                            age = calculateAge(convertFrenchShortMonthToEnglish(convertAndSwapDate((extractedObject.data[1][2][10][0])))) || 'N/A';
                        } catch (error) {}
                        try {
                            installs = formatInstalls(extractedObject.data[1][2][13][2]) || 'N/A';
                        } catch (error) {}
                        try {
                            category = extractedObject.data[1][2][79][0][0][2] || 'N/A';
                        } catch (error) {}
                        try {
                            short = extractedObject.data[1][2][73][0][1] || 'N/A';
                        } catch (error) {}
                        if (age != 'N/A' || installs != 'N/A' || category != 'N/A' || short != 'N/A') {
                            shouldBreak = true
                            break;
                        }
                    } catch (error) {}
                }
                if (shouldBreak)
                    break;
            }
            const targetDiv = document.querySelector('div.nRgZne').parentElement;
            const url = new URL(window.location.href);
            const searchParams = new URLSearchParams(url.search);
            const id = searchParams.get("id");
            targetDiv.innerHTML = found(age, installs, category, id, short, name) + targetDiv.innerHTML
            fetchDataUsingFetchAPI(id)
        }
    }
})

async function fetchDataUsingFetchAPI(id: string) {
    try {
      const response = await fetch('https://api.mobioptions.com/api/get-top-ranking/' + id);
      if (response.ok) {
        const data = await response.json();
        const ranking = document.getElementById("mobi-ranking")
        const countries = document.getElementById("mobi-countries")
        const imgElement = document.getElementById('mobi-picture') as HTMLImageElement;;
        imgElement.src = data.path_qr;
        ranking.innerHTML = data.top_country ? "Top Ranked" : "Not Ranked"
        if (data.top && Object.keys(data.top).length > 0) {
            const sortedJson = sortJsonByValues(data.top);
            if (ranking.innerHTML !== "Top Ranked")
                ranking.innerHTML = `Top Ranked In ${Object.keys(sortedJson)[0]}`
            let first = true;
            countries.innerHTML = ""
            countries.style.padding = "11px"
            for (const top in sortedJson) {
                if (sortedJson.hasOwnProperty(top)) {
                    const flagImg = document.createElement('img');

                    flagImg.src = `https://flagcdn.com/h20/${top.toLocaleLowerCase()}.png`;
                    flagImg.alt = top;
                    flagImg.title = `${top}: ${sortedJson[top]}`;

                    if(first)
                        first = false;
                    else
                        flagImg.style.paddingLeft = "5px";
                
                    countries?.appendChild(flagImg);
                }
            }
        }
        else{
            if (data.top_country) {

                const flagImg = document.createElement('img');

                flagImg.src = `https://flagcdn.com/h20/${data.top_country.toLocaleLowerCase()}.png`;
                flagImg.alt = data.top_country;
                flagImg.title = data.top_country;

                countries.innerHTML = ""
                countries.style.padding = "11px"
                countries?.appendChild(flagImg);
            }
            else {
                countries.innerHTML = "Not Ranked"
            }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
}

function sortJsonByValues(json: { [key: string]: number }): { [key: string]: number } {
    const sortedArray = Object.entries(json).sort((a, b) => a[1] - b[1]);
    const sortedJson: { [key: string]: number } = {};
    for (const [key, value] of sortedArray) {
      sortedJson[key] = value;
    }
    return sortedJson;
}

function formatInstalls(installs: string): string {
    const recent = parseInt(installs);
    if (recent >= 1000000000)
        return (recent / 1000000000).toFixed(2) + "B+";
    if (recent >= 1000000)
        return (recent / 1000000).toFixed(2) + "M+";
    if (recent >= 1000)
        return (recent / 1000).toFixed(2) + "K+";
    return recent + ''
}

function calculateAge(dateOfBirth: string) {
    const oneDay = 24 * 60 * 60 * 1000; // Number of milliseconds in a day
  
    // Parse the date strings into Date objects
    const dob = new Date(dateOfBirth);
    const today = new Date();
  
    // Calculate the difference in days
    const diffDays = Math.round(Math.abs((dob.getTime() - today.getTime()) / oneDay));
  
    if (diffDays < 30) {
      return `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) {
        return `${diffMonths} Month${diffMonths > 1 ? 's' : ''}`;
      } else {
        const diffYears = Math.floor(diffMonths / 12);
        return `${diffYears} Year${diffYears > 1 ? 's' : ''}`;
      }
    }
}

function convertAndSwapDate(dateString: string): string {
    const step1Result = dateString.replace(/‏/g, '');
    const step2Result = step1Result.replace(/(\d{2})\/(\d{2})\/(\d{4})/, (match, day, month, year) => {
      const swappedDate = `${month}/${day}/${year}`;
      return swappedDate;
    });
  
    return step2Result;
}

function convertFrenchShortMonthToEnglish(input: string): string {
    const frenchToEnglishShortMonths: { [key: string]: string } = {
      janv: 'Jan',
      févr: 'Feb',
      mars: 'Mar',
      avr: 'Apr',
      mai: 'May',
      juin: 'Jun',
      juil: 'Jul',
      août: 'Aug',
      sept: 'Sep',
      oct: 'Oct',
      nov: 'Nov',
      déc: 'Dec',
    };
  
    const regex = /(\d{1,2})\s(janv|févr|mars|avr|mai|juin|juil|août|sept|oct|nov|déc)\.?(\s(\d{4}))/gi;
  
    const result = input.replace(regex, (match, day, month, year) => {
      const lowerCaseMonth = month.toLowerCase();
      const englishMonth = frenchToEnglishShortMonths[lowerCaseMonth] || month;
      return `${day} ${englishMonth} ${year}`;
    });
  
    return result;
}

function convertToTitleCase(input: string): string {
    return input
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
}

function notFound(id: string) {
    return `
        <div style="direction: ltr; color: rgb(102, 102, 102); font-weight: bold; display: flex; justify-content: center; align-items: center; border-width: 1px; border-style: solid; border-color: rgb(161, 180, 217); border-image: initial; padding: 12px 0px;">
            <a style="display: flex; color: rgb(102, 102, 102); text-decoration: none;" href="https://mobioptions.com/play/app/${id}" target="_blank">
                <img width="75px" style="padding-right: 25px" src="https://mobioptions.com/wp-content/uploads/2023/06/logo.png">
                <p>Check this app meta data has been stored at MobiOptions</p>
            </a>
        </div>
    `
}

function found(appAge: string, installs: string, category: string, id: string, short: string, name: string) {
    return `
        <div style="direction: ltr; display: flex; margin: 35px 0px 15px 0px; flex-flow: row wrap; -webkit-box-pack: center; justify-content: center;">
            <div style="box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 10px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                        <div style="padding: 10px; background-image: linear-gradient(to bottom left, #279dff, #2430ef); text-align: center;">
                            <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.67 22.75H2C1.59 22.75 1.25 22.41 1.25 22V16C1.25 14.48 2.48 13.25 4 13.25H8.67C9.08 13.25 9.42 13.59 9.42 14V22C9.42 22.41 9.08 22.75 8.67 22.75ZM2.75 21.25H7.92V14.75H4C3.31 14.75 2.75 15.31 2.75 16V21.25Z" fill="#fff"/><path d="M15.3302 22.75H8.66016C8.25016 22.75 7.91016 22.41 7.91016 22V12C7.91016 10.48 9.14016 9.25 10.6602 9.25H13.3302C14.8502 9.25 16.0802 10.48 16.0802 12V22C16.0802 22.41 15.7502 22.75 15.3302 22.75ZM9.42015 21.25H14.5902V12C14.5902 11.31 14.0302 10.75 13.3402 10.75H10.6702C9.98015 10.75 9.42015 11.31 9.42015 12V21.25Z" fill="#fff"/><path d="M22.0001 22.75H15.3301C14.9201 22.75 14.5801 22.41 14.5801 22V17C14.5801 16.59 14.9201 16.25 15.3301 16.25H20.0001C21.5201 16.25 22.7501 17.48 22.7501 19V22C22.7501 22.41 22.4101 22.75 22.0001 22.75ZM16.0801 21.25H21.2501V19C21.2501 18.31 20.6901 17.75 20.0001 17.75H16.0801V21.25Z" fill="#fff"/><path d="M13.6999 8.34999C13.4599 8.34999 13.1599 8.27997 12.8199 8.07997L11.9999 7.58998L11.1899 8.06999C10.3699 8.55999 9.82989 8.26998 9.62989 8.12998C9.42989 7.98998 8.99989 7.54998 9.20989 6.62998L9.39989 5.79997L8.71989 5.11997C8.29989 4.69997 8.14989 4.19997 8.29989 3.73997C8.44989 3.27997 8.85989 2.95996 9.43989 2.85996L10.3099 2.70997L10.7999 1.72999C11.3399 0.65999 12.6499 0.65999 13.1799 1.72999L13.6699 2.70997L14.5399 2.85996C15.1199 2.95996 15.5399 3.27997 15.6799 3.73997C15.8299 4.19997 15.6699 4.69997 15.2599 5.11997L14.5799 5.79997L14.7699 6.62998C14.9799 7.55998 14.5499 7.98999 14.3499 8.13999C14.2599 8.21999 14.0299 8.34999 13.6999 8.34999ZM11.9999 6.07997C12.2399 6.07997 12.4799 6.13999 12.6799 6.25999L13.2399 6.58998L13.1199 6.04997C13.0199 5.62997 13.1699 5.11998 13.4799 4.80998L13.9899 4.29997L13.3599 4.18998C12.9599 4.11998 12.5699 3.82998 12.3899 3.46998L11.9999 2.71998L11.6199 3.46998C11.4399 3.82998 11.0499 4.11998 10.6499 4.18998L10.0199 4.28999L10.5299 4.79997C10.8399 5.10997 10.9799 5.61999 10.8899 6.03999L10.7699 6.57997L11.3299 6.24998C11.5199 6.12998 11.7599 6.07997 11.9999 6.07997Z" fill="#fff"/>
                            </svg>
                        </div>
                    </div>
                    <div id="mobi-ranking" style="color: rgb(238, 238, 238); font-size: 15px;padding: 15px;">Loading...</div>
                    <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                    <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Ranking</div>
                </div>
            </div>
            <div style="padding-left: 15px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 10px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                        <div style="padding: 10px; background-image: linear-gradient(to bottom left, #279dff, #2430ef); text-align: center;">
                            <svg fill="#fff" width="30px" height="30px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" d="M17,2 C17.5522847,2 18,2.44771525 18,3 L18,4 L19,4 C20.6568542,4 22,5.34314575 22,7 L22,19 C22,20.6568542 20.6568542,22 19,22 L5,22 C3.34314575,22 2,20.6568542 2,19 L2,7 C2,5.34314575 3.34314575,4 5,4 L6,4 L6,3 C6,2.44771525 6.44771525,2 7,2 C7.55228475,2 8,2.44771525 8,3 L8,4 L16,4 L16,3 C16,2.44771525 16.4477153,2 17,2 Z M4,12 L4,19 C4,19.5522847 4.44771525,20 5,20 L19,20 C19.5522847,20 20,19.5522847 20,19 L20,12 L4,12 Z M4,10 L20,10 L20,7 C20,6.44771525 19.5522847,6 19,6 L18,6 L18,7 C18,7.55228475 17.5522847,8 17,8 C16.4477153,8 16,7.55228475 16,7 L16,6 L8,6 L8,7 C8,7.55228475 7.55228475,8 7,8 C6.44771525,8 6,7.55228475 6,7 L6,6 L5,6 C4.44771525,6 4,6.44771525 4,7 L4,10 Z"/>
                            </svg>
                        </div>
                    </div>
                    <div style="color: rgb(238, 238, 238); font-size: 15px;padding: 15px;">${appAge}</div>
                    <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                    <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">App Age</div>
                </div>
            </div>
            <div style="padding-left: 15px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 10px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                        <div style="padding: 10px; background-image: linear-gradient(to bottom left, #279dff, #2430ef); text-align: center;">
                            <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2a1 1 0 0 1 1 1v10.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L11 13.586V3a1 1 0 0 1 1-1zM5 17a1 1 0 0 1 1 1v2h12v-2a1 1 0 1 1 2 0v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a1 1 0 0 1 1-1z" fill="#fff"/>
                            </svg>
                        </div>
                    </div>
                    <div style="color: rgb(238, 238, 238); font-size: 15px;padding: 15px;">${installs}</div>
                    <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                    <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Installs</div>
                </div>
            </div>
            <div style="padding-left: 15px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 10px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <a href="https://play.google.com/store/apps/category/${category}" target="_blank">
                        <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                            <div style="padding: 10px; background-image: linear-gradient(to bottom left, #279dff, #2430ef); text-align: center;">
                                <svg fill="#fff" width="30px" height="30px" viewBox="0 0 35 35" data-name="Layer 2" id="e73e2821-510d-456e-b3bd-9363037e93e3" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.933,15.055H3.479A3.232,3.232,0,0,1,.25,11.827V3.478A3.232,3.232,0,0,1,3.479.25h8.454a3.232,3.232,0,0,1,3.228,3.228v8.349A3.232,3.232,0,0,1,11.933,15.055ZM3.479,2.75a.73.73,0,0,0-.729.728v8.349a.73.73,0,0,0,.729.728h8.454a.729.729,0,0,0,.728-.728V3.478a.729.729,0,0,0-.728-.728Z"/><path d="M11.974,34.75H3.52A3.233,3.233,0,0,1,.291,31.521V23.173A3.232,3.232,0,0,1,3.52,19.945h8.454A3.232,3.232,0,0,1,15.2,23.173v8.348A3.232,3.232,0,0,1,11.974,34.75ZM3.52,22.445a.73.73,0,0,0-.729.728v8.348a.73.73,0,0,0,.729.729h8.454a.73.73,0,0,0,.728-.729V23.173a.729.729,0,0,0-.728-.728Z"/><path d="M31.522,34.75H23.068a3.233,3.233,0,0,1-3.229-3.229V23.173a3.232,3.232,0,0,1,3.229-3.228h8.454a3.232,3.232,0,0,1,3.228,3.228v8.348A3.232,3.232,0,0,1,31.522,34.75Zm-8.454-12.3a.73.73,0,0,0-.729.728v8.348a.73.73,0,0,0,.729.729h8.454a.73.73,0,0,0,.728-.729V23.173a.729.729,0,0,0-.728-.728Z"/><path d="M27.3,15.055a7.4,7.4,0,1,1,7.455-7.4A7.437,7.437,0,0,1,27.3,15.055Zm0-12.3a4.9,4.9,0,1,0,4.955,4.9A4.935,4.935,0,0,0,27.3,2.75Z"/>
                                </svg>
                            </div>
                        </div>
                        <div style="color: rgb(238, 238, 238); font-size: 15px;padding: 15px;">${category !== 'N/A' ? convertToTitleCase(category) : category}</div>
                        <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                        <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Category</div>
                    </a>
                </div>
            </div>
            <div style="box-sizing: border-box; margin: 0px; display: flex;">
                <div style="transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 10px; overflow: hidden; min-width: 100px; display: flex; align-self: center; justify-content: center;">
                    <img style="margin:10px" width="100px" height="100px" id="mobi-picture" src="https://cdn.mobioptions.com/developer-assets/images/icon.png" />
                </div>
            </div>
            <div style="padding-right: 15px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 10px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <a href="https://beta.mobioptions.com/details?id=${id}" target="_blank">
                        <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                            <div style="padding: 10px; background-image: linear-gradient(to bottom left, #279dff, #2430ef); text-align: center;">
                                <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="48px" height="30px" viewBox="0 0 1823.000000 1019.000000" preserveAspectRatio="xMidYMid meet">
                                    <g transform="translate(0.000000,1019.000000) scale(0.100000,-0.100000)" fill="#fff" stroke="none">
                                        <path d="M9280 10063 c-310 -17 -592 -171 -765 -419 -32 -46 -626 -648 -1810 -1834 -1203 -1205 -1774 -1784 -1800 -1825 -119 -184 -170 -355 -168 -570 1 -106 6 -148 27 -230 100 -382 386 -652 781 -737 33 -7 119 -12 190 -12 144 1 246 21 378 75 174 72 149 49 1219 1117 l997 996 4 -685 c3 -587 6 -693 20 -749 88 -356 327 -623 651 -729 123 -41 201 -53 331 -52 167 0 312 36 455 112 252 135 420 349 501 641 l24 83 6 1800 c4 1416 8 1812 18 1855 20 84 9 314 -18 415 -48 172 -136 322 -265 450 -196 195 -502 312 -776 298z"/> <path d="M5765 10049 c-160 -23 -347 -106 -480 -213 -123 -99 -3775 -3759 -3822 -3831 -125 -187 -178 -361 -177 -580 1 -146 22 -251 78 -385 95 -224 298 -426 521 -519 333 -139 718 -91 992 123 32 24 907 894 1944 1933 1725 1726 1891 1895 1937 1972 96 157 142 326 142 516 0 131 -17 228 -61 350 -156 430 -613 700 -1074 634z"/>
                                        <path d="M13480 10044 c-162 -19 -220 -28 -325 -49 -419 -84 -796 -254 -1150 -519 -163 -122 -423 -383 -546 -548 -287 -384 -466 -812 -541 -1293 -32 -205 -32 -607 1 -814 74 -478 256 -915 536 -1285 452 -600 1085 -976 1857 -1103 151 -25 649 -25 803 0 448 72 816 215 1170 452 405 272 719 626 941 1059 464 908 405 1997 -155 2837 -126 189 -203 283 -370 449 -320 318 -686 543 -1104 679 -303 98 -508 132 -842 136 -132 2 -256 1 -275 -1z m456 -1519 c132 -23 240 -59 363 -120 574 -288 855 -933 676 -1550 -118 -405 -451 -746 -859 -879 -138 -45 -238 -60 -406 -59 -120 0 -178 5 -258 22 -268 57 -496 184 -687 382 -191 199 -305 427 -350 698 -27 158 -17 377 24 534 35 137 112 307 193 424 75 110 235 267 345 341 155 103 333 176 499 206 108 19 349 20 460 1z"/>
                                        <path d="M16642 9763 c2 -14 15 -19 56 -21 l52 -3 0 -170 0 -169 25 0 25 0 0 169 0 170 52 3 c41 2 54 7 56 21 3 15 -8 17 -133 17 -125 0 -136 -2 -133 -17z"/> <path d="M16970 9590 l0 -190 25 0 24 0 3 138 3 137 61 -135 c81 -182 82 -182 160 -5 l59 136 3 -135 3 -136 24 0 25 0 0 191 0 190 -27 -3 c-24 -3 -33 -18 -93 -150 -37 -82 -69 -150 -72 -153 -3 -3 -36 65 -74 150 -65 146 -71 155 -96 155 l-28 0 0 -190z"/>
                                        <path d="M6754 3156 c-60 -19 -101 -54 -129 -110 -53 -105 -13 -220 93 -272 105 -52 225 -15 280 86 34 64 28 152 -14 212 -52 75 -149 110 -230 84z"/> <path d="M12633 3159 c-104 -24 -178 -144 -153 -248 30 -125 169 -195 288 -146 128 54 167 217 77 323 -55 64 -131 90 -212 71z"/>
                                        <path d="M4830 3120 c-41 -10 -67 -39 -75 -83 -3 -18 -5 -412 -3 -877 3 -837 4 -846 26 -923 35 -126 78 -203 157 -282 80 -81 153 -122 280 -161 86 -27 99 -28 300 -28 186 0 219 2 290 22 238 66 383 206 440 427 38 147 45 591 11 760 -43 213 -138 350 -301 430 -104 52 -173 67 -331 72 -229 9 -368 -33 -477 -144 l-57 -56 0 381 c0 218 -4 391 -10 406 -15 41 -52 57 -137 62 -43 2 -94 -1 -113 -6z m908 -987 c81 -32 117 -66 154 -140 l33 -68 0 -300 c0 -267 -2 -306 -19 -354 -25 -72 -85 -132 -161 -162 -55 -21 -75 -23 -230 -23 -155 0 -175 2 -230 23 -79 31 -148 100 -171 173 -22 68 -32 485 -15 597 18 116 65 192 146 234 73 38 131 47 290 43 124 -2 159 -6 203 -23z"/>
                                        <path d="M590 2974 c-126 -24 -222 -88 -272 -181 -29 -53 -63 -170 -72 -248 -17 -141 -116 -1579 -114 -1638 3 -63 6 -72 31 -91 25 -18 42 -21 136 -21 122 0 152 12 170 67 6 18 36 404 66 858 31 454 60 842 66 862 11 43 60 88 95 88 43 0 81 -27 98 -70 10 -25 58 -343 116 -773 55 -403 109 -762 120 -798 41 -139 116 -206 255 -230 184 -31 345 22 399 133 14 29 32 80 40 113 9 33 58 382 111 775 53 393 100 731 105 751 21 79 85 117 147 87 62 -29 60 -15 124 -924 32 -459 63 -850 69 -870 16 -47 46 -64 128 -71 95 -8 159 3 188 32 20 20 24 34 24 83 0 117 -120 1649 -135 1722 -40 196 -129 295 -301 336 -92 21 -237 14 -316 -16 -69 -26 -145 -91 -180 -157 -58 -107 -73 -188 -163 -934 -48 -393 -92 -725 -98 -738 -7 -13 -19 -29 -28 -34 -22 -14 -66 -1 -79 23 -6 11 -49 333 -95 717 -47 384 -91 730 -99 768 -41 199 -127 320 -259 361 -51 16 -228 27 -277 18z"/>
                                        <path d="M11323 2870 c-42 -17 -53 -53 -78 -240 -13 -100 -25 -183 -27 -184 -2 -1 -55 -12 -118 -24 -155 -30 -165 -39 -165 -163 0 -125 5 -129 165 -129 l119 0 3 -457 c4 -438 5 -461 26 -531 60 -197 169 -306 359 -358 134 -36 457 -23 552 23 49 25 71 71 71 154 0 92 -9 128 -36 146 -22 14 -33 14 -117 -3 -62 -13 -135 -19 -223 -19 -128 0 -131 1 -180 30 -37 24 -56 44 -79 90 l-30 59 -3 433 -3 433 276 0 276 0 24 24 c30 30 39 78 33 167 -6 79 -22 103 -77 119 -20 5 -147 10 -283 10 l-247 0 -3 195 c-4 237 1 229 -126 232 -48 2 -97 -1 -109 -7z"/>
                                        <path d="M3427 2465 c-222 -42 -384 -156 -466 -328 -63 -132 -66 -159 -66 -522 0 -315 1 -334 23 -410 65 -224 199 -351 437 -417 70 -19 105 -22 290 -23 191 0 217 2 290 23 234 68 366 189 437 401 l33 96 0 335 c0 320 -1 339 -23 415 -65 225 -199 352 -437 416 -106 28 -399 36 -518 14z m455 -334 c72 -28 130 -86 160 -159 22 -55 23 -68 23 -352 0 -284 -1 -297 -23 -351 -24 -61 -74 -119 -123 -145 -51 -26 -158 -44 -265 -44 -168 0 -260 26 -332 94 -82 76 -95 150 -90 488 5 283 11 312 75 387 74 87 160 112 368 107 125 -2 159 -7 207 -25z"/>
                                        <path d="M7935 2473 c-327 -51 -513 -221 -571 -521 -10 -52 -14 -152 -14 -340 0 -223 3 -282 19 -359 52 -249 192 -395 446 -465 71 -19 105 -22 295 -22 207 0 219 1 305 28 125 38 199 80 275 156 79 79 123 159 157 287 25 93 26 111 27 368 1 292 -7 365 -52 490 -67 189 -211 309 -432 361 -74 17 -382 29 -455 17z m403 -340 c81 -32 117 -66 154 -140 l33 -68 0 -305 0 -305 -33 -68 c-64 -129 -143 -162 -387 -162 -195 1 -250 17 -327 96 -73 74 -80 110 -86 391 -4 256 5 352 39 421 64 128 163 168 404 163 124 -2 159 -6 203 -23z"/>
                                        <path d="M9757 2465 c-225 -43 -378 -150 -466 -326 -78 -155 -76 -127 -76 -1079 0 -465 3 -857 8 -872 12 -44 57 -61 164 -61 102 0 136 13 153 59 6 15 10 187 10 401 l0 376 56 -56 c113 -114 240 -152 477 -144 233 8 353 50 467 166 80 80 123 160 157 288 22 87 26 123 30 333 10 423 -27 584 -168 735 -71 76 -174 132 -304 166 -106 28 -391 36 -508 14z m441 -330 c70 -24 133 -81 163 -147 23 -51 24 -63 27 -333 3 -190 0 -298 -8 -335 -24 -110 -86 -179 -193 -217 -74 -26 -337 -26 -419 0 -125 38 -189 122 -209 276 -17 123 -6 500 15 568 33 104 120 179 236 203 77 15 327 6 388 -15z"/>
                                        <path d="M13750 2460 c-278 -59 -433 -200 -501 -455 -19 -70 -23 -114 -27 -339 -5 -332 11 -452 78 -586 84 -166 236 -267 462 -306 121 -21 401 -15 498 11 244 64 396 213 462 452 20 72 22 100 22 388 0 290 -1 315 -22 390 -28 99 -69 187 -114 243 -81 102 -226 178 -393 207 -123 21 -355 19 -465 -5z m402 -311 c111 -24 179 -75 222 -169 20 -43 21 -61 21 -360 l0 -315 -28 -57 c-58 -117 -142 -158 -342 -165 -210 -8 -330 29 -396 119 -50 70 -60 123 -66 344 -10 381 24 502 160 569 29 14 73 29 97 34 66 13 271 13 332 0z"/>
                                        <path d="M15630 2474 c-254 -46 -402 -139 -483 -304 -65 -131 -67 -151 -67 -758 0 -577 1 -588 47 -607 35 -13 168 -17 211 -6 80 22 76 -6 82 611 l5 545 30 60 c57 115 151 150 380 143 124 -4 146 -7 195 -30 66 -31 92 -55 122 -111 23 -42 23 -45 28 -592 6 -617 3 -599 75 -623 54 -19 194 -11 229 11 46 30 48 60 44 636 -4 510 -5 540 -25 613 -31 109 -67 174 -137 243 -70 71 -152 114 -271 146 -64 17 -115 22 -260 24 -99 2 -191 1 -205 -1z"/>
                                        <path d="M17273 2465 c-144 -26 -214 -56 -286 -123 -90 -85 -123 -186 -115 -349 7 -128 34 -199 101 -271 68 -71 125 -103 372 -212 374 -164 425 -198 425 -285 0 -97 -46 -131 -202 -148 -123 -14 -342 3 -508 38 -63 14 -132 25 -153 25 -34 0 -40 -4 -53 -35 -19 -47 -19 -177 2 -221 19 -40 72 -62 221 -94 125 -27 435 -38 568 -21 317 42 455 181 455 456 0 207 -67 319 -250 418 -36 19 -167 79 -292 132 -314 134 -350 160 -352 249 -1 52 24 93 71 112 103 44 367 38 576 -12 158 -38 177 -24 177 127 0 123 -18 144 -150 183 -147 44 -450 60 -607 31z"/>
                                        <path d="M6721 2441 c-18 -5 -43 -19 -55 -30 -21 -22 -21 -22 -24 -766 -1 -410 1 -760 6 -777 14 -57 50 -73 161 -73 111 0 144 12 161 58 13 39 14 1495 0 1531 -15 41 -52 57 -137 62 -43 2 -93 -1 -112 -5z"/>
                                        <path d="M12590 2440 c-46 -11 -67 -40 -75 -103 -3 -28 -5 -372 -3 -762 3 -803 -2 -753 80 -776 58 -15 189 -7 221 14 45 29 47 68 46 815 -1 759 -2 776 -52 800 -35 17 -169 24 -217 12z"/>
                                    </g>
                                </svg>
                            </div>
                        </div>
                        <div style="color: rgb(238, 238, 238); font-size: 15px;padding: 15px;">MobiOptions</div>
                        <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                        <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Open In</div>
                    </a>
                </div>
            </div>
            <div style="padding-right: 15px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 10px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <a href="https://beta.mobioptions.com/search?q=${name}" target="_blank">
                        <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                            <div style="padding: 10px; background-image: linear-gradient(to bottom left, #279dff, #2430ef); text-align: center;">
                                <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="48px" height="30px" viewBox="0 0 1823.000000 1019.000000" preserveAspectRatio="xMidYMid meet">
                                    <g transform="translate(0.000000,1019.000000) scale(0.100000,-0.100000)" fill="#fff" stroke="none">
                                        <path d="M9280 10063 c-310 -17 -592 -171 -765 -419 -32 -46 -626 -648 -1810 -1834 -1203 -1205 -1774 -1784 -1800 -1825 -119 -184 -170 -355 -168 -570 1 -106 6 -148 27 -230 100 -382 386 -652 781 -737 33 -7 119 -12 190 -12 144 1 246 21 378 75 174 72 149 49 1219 1117 l997 996 4 -685 c3 -587 6 -693 20 -749 88 -356 327 -623 651 -729 123 -41 201 -53 331 -52 167 0 312 36 455 112 252 135 420 349 501 641 l24 83 6 1800 c4 1416 8 1812 18 1855 20 84 9 314 -18 415 -48 172 -136 322 -265 450 -196 195 -502 312 -776 298z"/> <path d="M5765 10049 c-160 -23 -347 -106 -480 -213 -123 -99 -3775 -3759 -3822 -3831 -125 -187 -178 -361 -177 -580 1 -146 22 -251 78 -385 95 -224 298 -426 521 -519 333 -139 718 -91 992 123 32 24 907 894 1944 1933 1725 1726 1891 1895 1937 1972 96 157 142 326 142 516 0 131 -17 228 -61 350 -156 430 -613 700 -1074 634z"/>
                                        <path d="M13480 10044 c-162 -19 -220 -28 -325 -49 -419 -84 -796 -254 -1150 -519 -163 -122 -423 -383 -546 -548 -287 -384 -466 -812 -541 -1293 -32 -205 -32 -607 1 -814 74 -478 256 -915 536 -1285 452 -600 1085 -976 1857 -1103 151 -25 649 -25 803 0 448 72 816 215 1170 452 405 272 719 626 941 1059 464 908 405 1997 -155 2837 -126 189 -203 283 -370 449 -320 318 -686 543 -1104 679 -303 98 -508 132 -842 136 -132 2 -256 1 -275 -1z m456 -1519 c132 -23 240 -59 363 -120 574 -288 855 -933 676 -1550 -118 -405 -451 -746 -859 -879 -138 -45 -238 -60 -406 -59 -120 0 -178 5 -258 22 -268 57 -496 184 -687 382 -191 199 -305 427 -350 698 -27 158 -17 377 24 534 35 137 112 307 193 424 75 110 235 267 345 341 155 103 333 176 499 206 108 19 349 20 460 1z"/>
                                        <path d="M16642 9763 c2 -14 15 -19 56 -21 l52 -3 0 -170 0 -169 25 0 25 0 0 169 0 170 52 3 c41 2 54 7 56 21 3 15 -8 17 -133 17 -125 0 -136 -2 -133 -17z"/> <path d="M16970 9590 l0 -190 25 0 24 0 3 138 3 137 61 -135 c81 -182 82 -182 160 -5 l59 136 3 -135 3 -136 24 0 25 0 0 191 0 190 -27 -3 c-24 -3 -33 -18 -93 -150 -37 -82 -69 -150 -72 -153 -3 -3 -36 65 -74 150 -65 146 -71 155 -96 155 l-28 0 0 -190z"/>
                                        <path d="M6754 3156 c-60 -19 -101 -54 -129 -110 -53 -105 -13 -220 93 -272 105 -52 225 -15 280 86 34 64 28 152 -14 212 -52 75 -149 110 -230 84z"/> <path d="M12633 3159 c-104 -24 -178 -144 -153 -248 30 -125 169 -195 288 -146 128 54 167 217 77 323 -55 64 -131 90 -212 71z"/>
                                        <path d="M4830 3120 c-41 -10 -67 -39 -75 -83 -3 -18 -5 -412 -3 -877 3 -837 4 -846 26 -923 35 -126 78 -203 157 -282 80 -81 153 -122 280 -161 86 -27 99 -28 300 -28 186 0 219 2 290 22 238 66 383 206 440 427 38 147 45 591 11 760 -43 213 -138 350 -301 430 -104 52 -173 67 -331 72 -229 9 -368 -33 -477 -144 l-57 -56 0 381 c0 218 -4 391 -10 406 -15 41 -52 57 -137 62 -43 2 -94 -1 -113 -6z m908 -987 c81 -32 117 -66 154 -140 l33 -68 0 -300 c0 -267 -2 -306 -19 -354 -25 -72 -85 -132 -161 -162 -55 -21 -75 -23 -230 -23 -155 0 -175 2 -230 23 -79 31 -148 100 -171 173 -22 68 -32 485 -15 597 18 116 65 192 146 234 73 38 131 47 290 43 124 -2 159 -6 203 -23z"/>
                                        <path d="M590 2974 c-126 -24 -222 -88 -272 -181 -29 -53 -63 -170 -72 -248 -17 -141 -116 -1579 -114 -1638 3 -63 6 -72 31 -91 25 -18 42 -21 136 -21 122 0 152 12 170 67 6 18 36 404 66 858 31 454 60 842 66 862 11 43 60 88 95 88 43 0 81 -27 98 -70 10 -25 58 -343 116 -773 55 -403 109 -762 120 -798 41 -139 116 -206 255 -230 184 -31 345 22 399 133 14 29 32 80 40 113 9 33 58 382 111 775 53 393 100 731 105 751 21 79 85 117 147 87 62 -29 60 -15 124 -924 32 -459 63 -850 69 -870 16 -47 46 -64 128 -71 95 -8 159 3 188 32 20 20 24 34 24 83 0 117 -120 1649 -135 1722 -40 196 -129 295 -301 336 -92 21 -237 14 -316 -16 -69 -26 -145 -91 -180 -157 -58 -107 -73 -188 -163 -934 -48 -393 -92 -725 -98 -738 -7 -13 -19 -29 -28 -34 -22 -14 -66 -1 -79 23 -6 11 -49 333 -95 717 -47 384 -91 730 -99 768 -41 199 -127 320 -259 361 -51 16 -228 27 -277 18z"/>
                                        <path d="M11323 2870 c-42 -17 -53 -53 -78 -240 -13 -100 -25 -183 -27 -184 -2 -1 -55 -12 -118 -24 -155 -30 -165 -39 -165 -163 0 -125 5 -129 165 -129 l119 0 3 -457 c4 -438 5 -461 26 -531 60 -197 169 -306 359 -358 134 -36 457 -23 552 23 49 25 71 71 71 154 0 92 -9 128 -36 146 -22 14 -33 14 -117 -3 -62 -13 -135 -19 -223 -19 -128 0 -131 1 -180 30 -37 24 -56 44 -79 90 l-30 59 -3 433 -3 433 276 0 276 0 24 24 c30 30 39 78 33 167 -6 79 -22 103 -77 119 -20 5 -147 10 -283 10 l-247 0 -3 195 c-4 237 1 229 -126 232 -48 2 -97 -1 -109 -7z"/>
                                        <path d="M3427 2465 c-222 -42 -384 -156 -466 -328 -63 -132 -66 -159 -66 -522 0 -315 1 -334 23 -410 65 -224 199 -351 437 -417 70 -19 105 -22 290 -23 191 0 217 2 290 23 234 68 366 189 437 401 l33 96 0 335 c0 320 -1 339 -23 415 -65 225 -199 352 -437 416 -106 28 -399 36 -518 14z m455 -334 c72 -28 130 -86 160 -159 22 -55 23 -68 23 -352 0 -284 -1 -297 -23 -351 -24 -61 -74 -119 -123 -145 -51 -26 -158 -44 -265 -44 -168 0 -260 26 -332 94 -82 76 -95 150 -90 488 5 283 11 312 75 387 74 87 160 112 368 107 125 -2 159 -7 207 -25z"/>
                                        <path d="M7935 2473 c-327 -51 -513 -221 -571 -521 -10 -52 -14 -152 -14 -340 0 -223 3 -282 19 -359 52 -249 192 -395 446 -465 71 -19 105 -22 295 -22 207 0 219 1 305 28 125 38 199 80 275 156 79 79 123 159 157 287 25 93 26 111 27 368 1 292 -7 365 -52 490 -67 189 -211 309 -432 361 -74 17 -382 29 -455 17z m403 -340 c81 -32 117 -66 154 -140 l33 -68 0 -305 0 -305 -33 -68 c-64 -129 -143 -162 -387 -162 -195 1 -250 17 -327 96 -73 74 -80 110 -86 391 -4 256 5 352 39 421 64 128 163 168 404 163 124 -2 159 -6 203 -23z"/>
                                        <path d="M9757 2465 c-225 -43 -378 -150 -466 -326 -78 -155 -76 -127 -76 -1079 0 -465 3 -857 8 -872 12 -44 57 -61 164 -61 102 0 136 13 153 59 6 15 10 187 10 401 l0 376 56 -56 c113 -114 240 -152 477 -144 233 8 353 50 467 166 80 80 123 160 157 288 22 87 26 123 30 333 10 423 -27 584 -168 735 -71 76 -174 132 -304 166 -106 28 -391 36 -508 14z m441 -330 c70 -24 133 -81 163 -147 23 -51 24 -63 27 -333 3 -190 0 -298 -8 -335 -24 -110 -86 -179 -193 -217 -74 -26 -337 -26 -419 0 -125 38 -189 122 -209 276 -17 123 -6 500 15 568 33 104 120 179 236 203 77 15 327 6 388 -15z"/>
                                        <path d="M13750 2460 c-278 -59 -433 -200 -501 -455 -19 -70 -23 -114 -27 -339 -5 -332 11 -452 78 -586 84 -166 236 -267 462 -306 121 -21 401 -15 498 11 244 64 396 213 462 452 20 72 22 100 22 388 0 290 -1 315 -22 390 -28 99 -69 187 -114 243 -81 102 -226 178 -393 207 -123 21 -355 19 -465 -5z m402 -311 c111 -24 179 -75 222 -169 20 -43 21 -61 21 -360 l0 -315 -28 -57 c-58 -117 -142 -158 -342 -165 -210 -8 -330 29 -396 119 -50 70 -60 123 -66 344 -10 381 24 502 160 569 29 14 73 29 97 34 66 13 271 13 332 0z"/>
                                        <path d="M15630 2474 c-254 -46 -402 -139 -483 -304 -65 -131 -67 -151 -67 -758 0 -577 1 -588 47 -607 35 -13 168 -17 211 -6 80 22 76 -6 82 611 l5 545 30 60 c57 115 151 150 380 143 124 -4 146 -7 195 -30 66 -31 92 -55 122 -111 23 -42 23 -45 28 -592 6 -617 3 -599 75 -623 54 -19 194 -11 229 11 46 30 48 60 44 636 -4 510 -5 540 -25 613 -31 109 -67 174 -137 243 -70 71 -152 114 -271 146 -64 17 -115 22 -260 24 -99 2 -191 1 -205 -1z"/>
                                        <path d="M17273 2465 c-144 -26 -214 -56 -286 -123 -90 -85 -123 -186 -115 -349 7 -128 34 -199 101 -271 68 -71 125 -103 372 -212 374 -164 425 -198 425 -285 0 -97 -46 -131 -202 -148 -123 -14 -342 3 -508 38 -63 14 -132 25 -153 25 -34 0 -40 -4 -53 -35 -19 -47 -19 -177 2 -221 19 -40 72 -62 221 -94 125 -27 435 -38 568 -21 317 42 455 181 455 456 0 207 -67 319 -250 418 -36 19 -167 79 -292 132 -314 134 -350 160 -352 249 -1 52 24 93 71 112 103 44 367 38 576 -12 158 -38 177 -24 177 127 0 123 -18 144 -150 183 -147 44 -450 60 -607 31z"/>
                                        <path d="M6721 2441 c-18 -5 -43 -19 -55 -30 -21 -22 -21 -22 -24 -766 -1 -410 1 -760 6 -777 14 -57 50 -73 161 -73 111 0 144 12 161 58 13 39 14 1495 0 1531 -15 41 -52 57 -137 62 -43 2 -93 -1 -112 -5z"/>
                                        <path d="M12590 2440 c-46 -11 -67 -40 -75 -103 -3 -28 -5 -372 -3 -762 3 -803 -2 -753 80 -776 58 -15 189 -7 221 14 45 29 47 68 46 815 -1 759 -2 776 -52 800 -35 17 -169 24 -217 12z"/>
                                    </g>
                                </svg>
                            </div>
                        </div>
                        <div style="color: rgb(238, 238, 238); font-size: 15px;padding: 15px;">Competitors</div>
                        <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                        <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Check</div>
                    </a>
                </div>
            </div>
            <div style="padding-right: 15px; box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 10px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <a href="https://apkcombo.com/app/${id}" target="_blank">
                        <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                            <div style="padding: 10px; background-image: linear-gradient(to bottom left, #279dff, #2430ef); text-align: center;">
                                <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="30px" height="30px" viewBox="0 0 550.801 550.801" fill="#fff" xml:space="preserve">
                                    <g>
                                        <path d="M136.129,282.393c-2.753-9.181-5.508-20.656-7.802-29.834h-0.453c-2.3,9.178-4.602,20.891-7.117,29.834l-9.181,32.827 h34.188L136.129,282.393z"/>
                                        <path d="M270.18,251.641c-7.117,0-11.934,0.686-14.468,1.377v45.67c2.987,0.686,6.661,0.918,11.712,0.918 c18.597,0,30.062-9.408,30.062-25.255C297.486,260.128,287.614,251.641,270.18,251.641z"/>
                                        <path d="M488.427,197.019h-13.226v-63.822c0-0.401-0.063-0.799-0.116-1.205c-0.021-2.531-0.828-5.023-2.563-6.993L366.325,3.694 c-0.031-0.034-0.063-0.045-0.084-0.076c-0.633-0.709-1.371-1.298-2.151-1.804c-0.232-0.158-0.465-0.287-0.707-0.422 c-0.675-0.366-1.393-0.675-2.131-0.896c-0.2-0.053-0.379-0.135-0.58-0.19C359.871,0.119,359.037,0,358.193,0H97.201 c-11.918,0-21.6,9.693-21.6,21.601v175.413H62.378c-17.049,0-30.874,13.818-30.874,30.87v160.542 c0,17.044,13.824,30.876,30.874,30.876h13.223V529.2c0,11.907,9.682,21.601,21.6,21.601h356.4c11.907,0,21.601-9.693,21.601-21.601 V419.302h13.226c17.044,0,30.87-13.827,30.87-30.87V227.89C519.297,210.832,505.471,197.019,488.427,197.019z M97.201,21.601 h250.193v110.51c0,5.967,4.841,10.8,10.8,10.8h95.407v54.108h-356.4V21.601z M332.143,273.444c0,15.14-5.052,27.997-14.222,36.719 c-11.944,11.243-29.61,16.3-50.274,16.3c-4.583,0-8.709-0.237-11.929-0.69v55.308h-34.652V228.456 c10.79-1.83,25.943-3.206,47.274-3.206c21.584,0,36.951,4.126,47.287,12.382C325.493,245.439,332.143,258.293,332.143,273.444z M95.516,381.08h-36.26l47.271-154.691h45.9l47.965,154.691h-37.645l-11.929-39.704h-44.292L95.516,381.08z M453.601,523.347 h-356.4V419.302h356.4V523.347z M440.259,381.08l-37.874-66.783l-13.31,16.295v50.488h-34.657V226.389h34.657v68.392h0.686 c3.438-5.964,7.113-11.47,10.558-16.985l35.121-51.411h42.909l-51.188,65.87l53.937,88.815h-40.838V381.08z"/>
                                    </g>
                                </svg>
                            </div>
                        </div>
                        <div style="color: rgb(238, 238, 238); font-size: 15px;padding: 15px;">APKCombo</div>
                        <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                        <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Open In</div>
                    </a>
                </div>
            </div>
            <div style="box-sizing: border-box; margin: 0px; flex-direction: row;">
                <div style="text-align: center; background-color: rgb(18, 18, 18); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 10px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; background-image: linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)); overflow: hidden; min-width: 110px;">
                    <div style="display: block; background-size: cover; background-repeat: no-repeat; background-position: center center;">
                        <div style="padding: 10px; background-image: linear-gradient(to bottom left, #279dff, #2430ef); text-align: center;">
                            <svg fill="#fff" width="30px" height="30px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1">
                                <path d="M21,4H18V3a1,1,0,0,0-1-1H7A1,1,0,0,0,6,3V4H3A1,1,0,0,0,2,5V8a4,4,0,0,0,4,4H7.54A6,6,0,0,0,11,13.91V16H10a3,3,0,0,0-3,3v2a1,1,0,0,0,1,1h8a1,1,0,0,0,1-1V19a3,3,0,0,0-3-3H13V13.91A6,6,0,0,0,16.46,12H18a4,4,0,0,0,4-4V5A1,1,0,0,0,21,4ZM6,10A2,2,0,0,1,4,8V6H6V8a6,6,0,0,0,.35,2Zm8,8a1,1,0,0,1,1,1v1H9V19a1,1,0,0,1,1-1ZM16,8A4,4,0,0,1,8,8V4h8Zm4,0a2,2,0,0,1-2,2h-.35A6,6,0,0,0,18,8V6h2Z"/>
                            </svg>
                        </div>
                    </div>
                    <div id="mobi-countries" style="color: rgb(238, 238, 238); font-size: 15px;padding: 15px;">Loading...</div>
                    <hr style="margin: 0px;flex-shrink: 0;border-width: 0px 0px thin;border-style: solid;border-color: rgba(255, 255, 255, 0.12);">
                    <div style="color: rgb(117, 117, 117); text-transform: uppercase; padding: 15px 5px;">Countries</div>
                </div>
            </div>
        </div>
        <div style="width: calc(100% + 15px); display: flex; justify-content: center;">
            <div style="background-image: linear-gradient(to bottom left, #279dff, #2430ef); color: rgb(255, 255, 255); transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms; border-radius: 4px; box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px; overflow: hidden; text-align: center; font-size: 18px;">
                <div style="padding: 10px;">
                    ${short}
                </div>
            </div>
        </div>
    `
}