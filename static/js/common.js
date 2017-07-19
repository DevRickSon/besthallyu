(function($){
    var vurl = $('#vurl'),
        vfile = $('#vfile'),
        agree = $('#agree'),
        indc = $('.indc'),
        frm = $('form');

    $('.wrp_radio').each(function(a){
        radioUI($(this));
    });

    vurl.on('focus', function(e){
        if(vfile.val() !== ''){
            var flag = confirm('Only 1 file can be upload');

            if(flag){
                vfile.remove();
                vfile = $('<input type="file" name="vfile" id="vfile" title="browse a file" />').appendTo('.area_up');
            }else{
                $(this).blur();
            }
        }
    });

    $('.vfile').on('click', function(e){
        if(vurl.val() !== ''){
            var flag = confirm('Only 1 file can be upload');

            if(flag){
                vurl.val('');
                vfile.trigger('click');
            }
        }else{
            vfile.trigger('click');
        }

        return false;
    });

    $('.sbm').on('click', function(e){
        if(vurl.val() === '' && vfile.val() === ''){
            alert('Choose between url or file upload');
            vurl.focus();
            return false;
        }

        if(!agree.prop('checked')){
            alert('Check the checkbox to submit');
            agree.focus();
            return false;
        }

        indc.show();
        frm.submit();
        return false;
    });

    function radioUI(scope){
        var radio = scope.find('label'),
            input = scope.find('input'),
            current = null;

        radio.each(function(a){
            if(input.eq(a).prop('checked')){
                active($(this));
            }
        });

        radio.on('click', function(e){
            if(current) deactive(current);
            active($(this));
        });

        function active(item){
            item.addClass('on');
            current = item;
        }

        function deactive(item){
            item.removeClass('on');
        }
    }
}(jQuery));
