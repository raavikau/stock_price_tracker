var tickers = JSON.parse(localStorage.getItem('tickers')) || [];
var lastPrices = {};
var counter = 15;

function startUpdateCycle() {
    updatePrices();
    setInterval( function() {
        counter--;
        $('#counter').text(counter);
        if ( counter <= 0 ) {
            updatePrices();
            counter = 15;
        }
    }, 1000)
}

document.getElementById("toggleButton").onclick = function(){
    var content = document.getElementById("tickers-table");
    if ( content.style.display === "none" ) {
        content.style.display = "block";
    } else {
        content.style.display = "none";
    }
};

$(document).ready(function(){

    tickers.forEach(function(ticker){
        addTickerToTable(ticker);  // when doc ready add stored tickers
    });

    updatePrices();

    $('#add-ticker-form').submit(function(e){ // addition of new tickers
        e.preventDefault();
        var newTicker = $('#new-ticker').val().toUpperCase();
        if (!tickers.includes(newTicker)) {  // ticker not in list
            tickers.push(newTicker);
            localStorage.setItem('tickers', JSON.stringify(tickers)) // saved in local storage
            addTickerToTable(newTicker);
        }
        $('new-ticker').val('');
        updatePrices();
    });

    $('#tickers-table').on('click', '.remove-btn', function() {  // in ticker table, use .on(click..) will work that match remove-btn
        var tickerToRemove = $(this).data('ticker');  // $this refers to .remove-btn .data retrieves value of the ticker
        tickers = tickers.filter(t => t !== tickerToRemove); // filter create new array t, check condition ticker != tickerToRemove are kept
        localStorage.setItem('tickers', JSON.stringify(tickers)) // new array, save back to local in json frmt, ensure remove ticker won't appear when page reload
        $(`#${tickerToRemove}`).remove();  // delete row from dom
    });

    startUpdateCycle();
});

function addTickerToTable(ticker) {
    $('#tickers-table').append(
        `<tr id="${ticker}">
            <td>${ticker}</td>
            <td id="${ticker}-status"></td>
            <td id="${ticker}-price"></td>
            <td id="${ticker}-change"></td>
            <td id="${ticker}-pct"></td>
            <td><button class="remove-btn" data-ticker="${ticker}">Remove</button></td>
        </tr>`
    )
}

function updatePrices(){
    tickers.forEach(function(ticker) {
        $.ajax({
            url: '/get_stock_data',
            type: 'POST',
            data: JSON.stringify({'ticker': ticker}),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(data) {
                var changePrice = data.currentPrice - data.openPrice
                var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100;
                var colorClass;
                if (changePercent <= -2) {  // text based color on stock price movement
                    colorClass = 'dark-red'
                } else if (changePercent < 0) {
                    colorClass = 'green'
                } else if (changePercent == 0) {
                    colorClass = 'gray'
                } else if (changePercent <= 2) {
                    colorClass = 'red'
                } else {
                    colorClass = 'dark-green'
                }

                $(`#${ticker}-price`).text(`$${data.currentPrice.toFixed(2)}`);
                $(`#${ticker}-change`).text(`$ ${changePrice.toFixed(2)}`);
                $(`#${ticker}-pct`).text(`${changePercent.toFixed(2)}%`);
                $(`#${ticker}-price`).removeClass('dark-red red gray green dark-green').addClass(colorClass);
                $(`#${ticker}-pct`).removeClass('dark-red red gray green dark-green').addClass(colorClass);

                var flashClass;  // flash effect to draw attention to price change
                if (lastPrices[ticker] > data.currentPrice) {  // current price compare with previous
                    flashClass = 'red-flash';
                    $(`#${ticker}-status`).text(`${'🔻'}`);
                } else if (lastPrices[ticker] < data.currentPrice) {
                    flashClass = 'green-flash';
                    $(`#${ticker}-status`).text(`${'🔺'}`);
                } else {
                    flashClass = 'gray-flash';
                    $(`#${ticker}-status`).text('⚖️');
                }
                lastPrices[ticker] = data.currentPrice;

                $(`#${ticker}`).addClass(flashClass);
                setTimeout(function(){
                    $(`#${ticker}`).removeClass(flashClass);
                }, 1000);
            }
        });
    });
}
