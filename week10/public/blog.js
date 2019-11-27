$(function(){
    $('input').change(function() {
        getResults()
        console.log($(this).val())
    });
});

function getResults(){
    var parameters = { start: $('input[name="start"]').val(), end: $('input[name="end"]').val()};
    $.get( '/blog',parameters, function(data) {
        $('#blogpost').html(data)
    });
}

function init(){
    getResults()
}

init()