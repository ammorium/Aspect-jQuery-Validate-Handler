(function ($) {
    $.fn.aspectValidateHandler = function (setting) {
        var defaultSetting = {
            error: {
                class: 'error',
                time: 5000
            },
            success: {
                class: 'success',
                time: 0
            },
            type: 'get',
            uri: '',
            messages: {
                error: {},
                success: {}
            },
            appendTo: 'form', // or input,
            successCallback: function() {},
            debug: false
        };
        setting = $.extend(defaultSetting, setting);
        var info_elements = '.' + setting.error.class + ', .' + setting.success.class;
        var $form = $(this);

        function show_message(message, is_error) {
            var code, message_text, message_info, time, remove_message_info;
            message_info = $('<div/>').hide();
            if(typeof message === "object") {
                code = message['code'];
            }else {
                code = message;
            }
            if (is_error) {
                message_info.addClass(setting.error.class);
                time = setting.error.time;
                message_text = setting.messages.error[code];
            } else {
                message_info.addClass(setting.success.class);
                time = setting.success.time;
                message_text = setting.messages.success[code];
            }
            message_info.text(message_text);

            switch (setting.appendTo) {
                case 'form' :
                {
                    $form.append(message_info);
                    break;
                }
                case 'input':
                {
                    var to = message['to'];
                    if(to === 'form' || to == null || !$(to).length) {
                        $form.append(message_info);
                    }else {
                        $(to).after(message_info);
                    }
                    break;
                }
            }
            remove_message_info = function () {
                message_info.slideUp('fast', function () {
                    $(this).remove();
                });
            };
            message_info.slideDown('fast', function () {
                if (time > 0) {
                    setTimeout(remove_message_info, time);
                }
            });
        }

        $form.on('submit', function (e) {
            e.preventDefault();
            if (($form.find(info_elements).length && $form.data('has_errors')) || $form.data('success')) return;
            $.ajax(setting.uri, {
                type: setting.type,
                data: $form.serialize()
            }).done(function (response) {
                var is_error = !response.success;
                var messages = response.data;
                if(setting.debug) console.log(response);
                if (is_error) {
                    $form.data('has_errors', 1);
                } else {
                    $form.data('success', 1);
                    setting.successCallback();
                }

                if (Array.isArray(messages)) {
                    for (var i = 0; i < messages.length; i++) {
                        show_message(messages[i], is_error);
                    }
                } else {
                    show_message(messages, is_error);
                }
            });
        });
        return this;
    };
}(jQuery));