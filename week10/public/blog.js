$(function(){
    $('input').change(function() {
        getResults()
        console.log($(this).val())
    });
    $('select').change(function() {
        getResults()
        console.log($(this).val())
    });
});

function getResults(){
    var parameters = { start: $('input[name="start"]').val(), end: $('input[name="end"]').val(), category: $('select[name="category"]').val()};
    $.get( '/blog',parameters, function(data) {
        console.log(data)
        $('#blogpost').html(data)
    });
}

function init(){
    getResults()
}

init()