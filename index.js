(function () {
  const BASE_URL = 'https://api.exchangerate-api.com/v4/latest/'
  const LOC_URL = 'https://ssl.geoplugin.net/json.gp?k=7b14a388b4ddd6e3'
  const CURRENCY = ['TWD', 'USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CNY', 'AUD', 'CAD', 'CZK', 'HKD', 'HUF', 'ISK', 'KRW', 'MYR', 'NZD', 'PLN', 'SGD', 'THB', 'TRY']
  const userIP = document.querySelector('.userIP')
  const IPCountry = document.querySelector('.IPCountry')
  const dataPanel = document.querySelector('.dataPanel')
  const searchInput = document.getElementById('search')
  const searchButton = document.getElementById('submit-search')
  const twd = document.querySelector('#twd')
  const usd = document.querySelector('#usd')
  const eur = document.querySelector('#eur')
  const gbp = document.querySelector('#gbp')
  const chf = document.querySelector('#chf')
  const jpy = document.querySelector('#jpy')
  const cny = document.querySelector('#cny')
  let data = []

  //初始呼叫
  setDefault(data)
  //相關的啟用 function 要放在 axios 裡，以免async特性導致資料抓不到 
  function setDefault(data) {
    //取得IP位置
    axios
      .get(LOC_URL)
      .then(location => {
        const IP = location.data.geoplugin_request
        const defaultCurrency = location.data.geoplugin_currencyCode
        const yourCountry = location.data.geoplugin_countryName
        if (CURRENCY.includes(defaultCurrency)) {
          typeChoice = defaultCurrency
          asyncDefaultDisplay(data, typeChoice, yourCountry, IP, defaultCurrency)
        } else {
          asyncDefaultDisplay(data, "USD", yourCountry, IP)
        }
      })
      .catch((error) => console.log(error))
    //顯示對應貨幣
    let asyncDefaultDisplay = async (data, typeChoice, yourCountry, IP, defaultCurrency) => {
      await axios
        .get(BASE_URL + typeChoice)
        .then(response => {
          timeData = Object.entries(response.data)
          //console.log(timeData)
          data = Object.entries(response.data.rates)
          //console.log(data[0][0])
          //console.log(data[0][1])
          displayIP(yourCountry, IP, defaultCurrency)
          process(data, timeData)
        })
        .catch((error) => console.log(error))
    }
  }

  //數據處理流程
  function process(data, timeData) {
    round(data)
    reverse(data)
    filterCurrency(data)
    unixChange(timeData)
    display(data, timeData)
  }

  //數值四捨五入
  function round(data) {
    for (let i = 0; i < data.length; i++) {
      data[i][1] = data[i][1].toFixed(3)
    }
  }

  //數值反運算
  function reverse(data) {
    for (let i = 0; i < data.length; i++) {
      data[i][2] = (1 / data[i][1]).toFixed(3)
    }
  }

  //刪除某些貨幣(要先知道 index number)
  function filterCurrency(data) {
    const filterData = ['BGN', 'BRL', 'DKK', 'HRK', 'IDR', 'ILS', 'INR', 'MXN', 'NOK', 'PEN', 'PHP', 'RON', 'RUB', 'SAR', 'SEK', 'ZAR']
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < filterData.length; j++) {
        if (data[i][0] === filterData[j]) {
          data.splice(i, 1) //splice 刪除不連續 array
          i--
        }
      }
    }
  }

  //Unix時間轉換器
  function unixChange(timeData) {
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    const day_list = ['日', '一', '二', '三', '四', '五', '六']
    let date = new Date(timeData[2][1] * 1000);
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate();
    let weekday = day_list[date.getDay()]
    // Hours part from the timestamp
    let hours = date.getHours(); // 根據所在地時區顯示
    // Minutes part from the timestamp
    let minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    let seconds = "0" + date.getSeconds();
    //(hours < 12) ? (hours = '上午 ' + hours + ' ') : (hours = '下午 ' + hours + ' ')
    // Will display time in format
    let formattedTime = year + "年" + month + '月' + day + '日 星期' + weekday + '  ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + ' 更新'
    timeData[2][2] = formattedTime
  }

  //顯示IP Address & CURRENCY CODE
  function displayIP(yourCountry, IP, defaultCurrency) {
    let IPHtmlContent = ''
    let countryHtmlContent = ''
    IPHtmlContent = `
      <span>您的IP位置是 ${IP}</span>
    `
    userIP.innerHTML = IPHtmlContent
    if (defaultCurrency !== null) {
      countryHtmlContent = `
      <span>您的所在位置是：${yourCountry}</span>
      <p>貨幣預設代碼為：${defaultCurrency}</p>
    `
    } else {
      countryHtmlContent = `
      <span>您的所在位置是： ${yourCountry}</span>
      <p>貨幣預設代碼為：USD</p>
    `
    }
    IPCountry.innerHTML = countryHtmlContent
  }

  //顯示數據於桌面上
  function display(data, timeData) {
    const directory = { 'AUD': '澳幣', 'CAD': '加拿大幣', 'CHF': '瑞士法郎', 'CNY': '人民幣', 'CZK': '捷克克朗', 'EUR': '歐元', 'GBP': '英鎊', 'HKD': '港幣', 'HUF': '匈牙利福林', 'ISK': '冰島克朗', 'JPY': '日圓', 'KRW': '韓圜', 'MYR': '馬來西亞令吉', 'NZD': '紐幣', 'PLN': '波蘭盾', 'SGD': '新加坡幣', 'THB': '泰銖', 'TWD': '新台幣', 'TRY': '土耳其里拉', 'USD': '美元' }
    //替貨幣代碼加上中文字
    let codesArray = [].concat.apply([], data) // 二維array＝>一維
    for (let i = 3; i < codesArray.length; i += 3) {
      //console.log(directory[codesArray[i]])
      for (let j = 1; j < data.length; j++) {
        if (directory[data[j][0]] === directory[codesArray[i]]) {
          data[j][0] = data[j][0] + " " + directory[data[j][0]]
          //console.log(data[j][0])
        }
      }
    }

    let htmlContent = ''
    htmlContent += `
    <div class="time">${timeData[2][2]}</div>
    <div class="description"><p>根據電腦所在地時間轉換</p></div>
    <div class="defaultCurrency"><p>根據IP位置自動切換預設貨幣。若沒有該貨幣資料，預設為美元。</p></div>
    <div class="custom-table-width">
      <table class="table table-sm" id ='rateTable'>
        <thead class="thead-dark">
          <tr>
            <th>貨幣名稱</th>
            <th>1 基準貨幣 = ?目標貨幣</th>
            <th>1 目標貨幣 = ?基準貨幣</th>
          </tr>
        </thead>
        <tbody>
    `
    for (let i = 1; i < data.length; i++) {
      htmlContent += `
          <tr>
            <td><h3>${data[i][0]}</h3>
            <td><p>${data[i][1]}</p></td>
            <td><p>${data[i][2]}</p></td>
          </tr>
    `
      //console.log(htmlContent)
    }
    htmlContent += `
        </tbody>
      </table>
    </div>  
    `
    dataPanel.innerHTML = htmlContent
  }

  //TWD,USD,EUR,GBP,CHF,JPY,CNY貨幣監聽器
  twd.addEventListener('click', function () {
    typeChoice = 'TWD'
    if (typeChoice === 'TWD') {
      axios
        .get(BASE_URL + CURRENCY[0])
        .then((response) => {
          timeData = Object.entries(response.data)
          data = Object.entries(response.data.rates)
          process(data, timeData)
        })
        .catch((error) => console.log(error))
    }
  })

  usd.addEventListener('click', function () {
    typeChoice = 'USD'
    if (typeChoice === 'USD') {
      axios
        .get(BASE_URL + CURRENCY[1])
        .then((response) => {
          timeData = Object.entries(response.data)
          data = Object.entries(response.data.rates)
          process(data, timeData)
        })
        .catch((error) => console.log(error))
    }
  })

  eur.addEventListener('click', function () {
    typeChoice = 'EUR'
    if (typeChoice === 'EUR') {
      axios
        .get(BASE_URL + CURRENCY[2])
        .then((response) => {
          timeData = Object.entries(response.data)
          data = Object.entries(response.data.rates)
          process(data, timeData)
        })
        .catch((error) => console.log(error))
    }
  })

  gbp.addEventListener('click', function () {
    typeChoice = 'GBP'
    if (typeChoice === 'GBP') {
      axios
        .get(BASE_URL + CURRENCY[3])
        .then((response) => {
          timeData = Object.entries(response.data)
          data = Object.entries(response.data.rates)
          process(data, timeData)
        })
        .catch((error) => console.log(error))
    }
  })

  chf.addEventListener('click', function () {
    typeChoice = 'CHF'
    if (typeChoice === 'CHF') {
      axios
        .get(BASE_URL + CURRENCY[4])
        .then((response) => {
          timeData = Object.entries(response.data)
          data = Object.entries(response.data.rates)
          process(data, timeData)
        })
        .catch((error) => console.log(error))
    }
  })

  jpy.addEventListener('click', function () {
    typeChoice = 'JPY'
    if (typeChoice === 'JPY') {
      axios
        .get(BASE_URL + CURRENCY[5])
        .then((response) => {
          timeData = Object.entries(response.data)
          data = Object.entries(response.data.rates)
          process(data, timeData)
        })
        .catch((error) => console.log(error))
    }
  })

  cny.addEventListener('click', function () {
    typeChoice = 'CNY'
    if (typeChoice === 'CNY') {
      axios
        .get(BASE_URL + CURRENCY[6])
        .then((response) => {
          timeData = Object.entries(response.data)
          data = Object.entries(response.data.rates)
          process(data, timeData)
        })
        .catch((error) => console.log(error))
    }
  })

  //search 監聽器
  searchButton.addEventListener('click', event => {
    //event.preventDefault()
    let code = searchInput.value
    //console.log('click')
    axios
      .get(BASE_URL + code)
      .then((response) => {
        timeData = Object.entries(response.data)
        data = Object.entries(response.data.rates)
        process(data, timeData)
      })
      .catch((error) => alert('輸入錯誤，請再試一次'))
    searchInput.value = ''
  })

  //ENTER 監聽器
  searchInput.addEventListener('keydown', event => {
    let code = searchInput.value
    if (event.keyCode == 13) { //keyCode 的 c 為大寫
      axios
        .get(BASE_URL + code)
        .then((response) => {
          timeData = Object.entries(response.data)
          data = Object.entries(response.data.rates)
          process(data, timeData)
        })
        .catch((error) => alert('輸入錯誤，請再試一次'))
      searchInput.value = ''
    }
  })

})()