// listen for the user changing any settings and call getResults()
$(function(){
    $('select').change(function() {
        if (parseInt($('select[name="end"]').val()) < parseInt($('select[name="start"]').val())){
            $('select[name="end"]').val($('select[name="start"]').val())
        }
        if (parseInt($('select[name="start"]').val()) > parseInt($('select[name="end"]').val())){
            $('select[name="start"]').val($('select[name="end"]').val())
        }
        if (parseInt($('select[name="endyear"]').val()) < parseInt($('select[name="startyear"]').val())){
            $('select[name="endyear"]').val($('select[name="startyear"]').val())
        }
        if (parseInt($('select[name="startyear"]').val()) > parseInt($('select[name="endyear"]').val())){
            $('select[name="startyear"]').val($('select[name="endyear"]').val())
        }

        getResults()
    });
});


function getResults(){
    
    // send the current settings to the endpoint
    var parameters = { start: $('select[name="start"]').val(), startyear: $('select[name="startyear"]').val(), end: $('select[name="end"]').val(), endyear: $('select[name="endyear"]').val(), category: $('select[name="category"]').val()};
    $.get( '/blog',parameters, function(data) {
        // the return data (hanlebars html) is added to the blogpost DIV.
        console.log('get new results')
        $('#blogpost').html(data)
    });
}

// make the call to the endpoint on pageload.
function init(){
    $(`select[name="start"]`).val(01)
    $(`select[name="end"]`).val(new Date().getMonth()+1)

    
    //build month dropdown
    var currentyear = new Date().getYear()
    currentyear += 1900
    for (var i=2018; i<currentyear;i++){
        $('select[name="startyear"]').append(`<option value="${i+1}">${i+1}</option>`) 
        $('select[name="endyear"]').append(`<option value="${i+1}">${i+1}</option>`) 
    }
    
    
    $(`select[name="startyear"]`).val(2019)
    $(`select[name="endyear"]`).val(new Date().getYear()+1900)

    getResults()

}

init()

//expand div width on click
$("#blogpost").click(function() {
    $('#blogpost *').removeClass( 'focuspost');
    if ($(event.target).attr('class') == 'col-xs-4'){
        $(event.target).addClass('focuspost' )
    }
});