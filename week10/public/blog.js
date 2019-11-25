$(function(){
    $('input').change(function() {
        getResults()
    });
});

function getResults(){
    var parameters = { start: $('input[name="start"]').val(), end: $('select[name="end"]').val()};
    $.get( '/blog',parameters, function(data) {
        $('#blogpost').html(data)
    });
}

function init(){
    getResults()
}

init()