var counter = 15;

function startUpdateCycle() {
    setInterval( function() {
        counter--;
        $('#counter').text(counter);
        if ( counter <= 0 ) {
            updatePrices();
            counter = 15;
        }
    }, 1000)
}
startUpdateCycle()