
    //var textarea = $('#content');
    var editor = ace.edit("editor");

    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");

    var input = $('input[name="content"]');

    editor.getSession().on('change', function () {
        input.val(editor.getSession().getValue());
    });

    input.val(editor.getSession().getValue());
