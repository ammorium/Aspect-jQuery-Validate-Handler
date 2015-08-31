(function ($) {
    $.fn.aspectValidateHandler = function (setting) {
        var $form = $(this);
        var defaultSetting = {
            error: {
                class: 'error',
                time: 5000,
                show: true,
                messages: {},
                callback: function (message) {
                }
            },
            success: {
                class: 'success',
                time: 0,
                show: true,
                messages: {},
                callback: function (message) {
                }
            },
            type: 'get',
            uri: $form.attr('action'),
            insertTo: 'after', // or before
            appendTo: 'form', // or input,
            debug: false
        };
        setting = $.extend(true, defaultSetting, setting);
        var info_elements = '.' + setting.error.class + ', .' + setting.success.class;

        function show_message(message, is_error) {
            var code, message_text, message_info, time, remove_message_info;
            message_info = $('<div/>').hide();
            if (typeof message === "object") {
                code = message['code'];
            } else {
                code = message;
            }
            if (is_error) {
                message_info.addClass(setting.error.class);
                time = setting.error.time;
                message_text = setting.error.messages[code];
                setting.error.callback(message_text);
                if (!setting.error.show) return;
            } else {
                message_info.addClass(setting.success.class);
                time = setting.success.time;
                message_text = setting.success.messages[code];
                setting.success.callback(message_text);
                if (!setting.success.show) return;
            }
            message_info.html(message_text);

            switch (setting.appendTo) {
                case 'form' :
                {
                    if (setting.insertTo === 'after') {
                        $form.append(message_info);
                    } else if (setting.insertTo === 'before') {
                        $form.prepend(message_info);
                    }
                    break;
                }
                case 'input':
                {
                    var to = message['to'];
                    if (to === 'form' || to == null || !$(to).length) {
                        if (setting.insertTo === 'after') {
                            $form.append(message_info);
                        } else if (setting.insertTo === 'before') {
                            $form.prepend(message_info);
                        }
                    } else {
                        if (setting.insertTo === 'after') {
                            $(to).after(message_info);
                        } else if (setting.insertTo === 'before') {
                            $(to).before(message_info);
                        }
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
            if (($form.find(info_elements).length && $form.data('has_errors')) || $form.data('success') || $form.data('loading')) return;
            $form.data('loading', 1);
            $.ajax(setting.uri, {
                type: setting.type,
                data: $form.serialize()
            }).done(function (response) {
                var is_error = !response.success;
                var messages = response.data;
                if (setting.debug) console.log(response);
                if (is_error) {
                    $form.data('has_errors', 1);
                } else {
                    $form.data('success', 1);
                }
                $form.data('loading', 0);

                if (Array.isArray(messages)) {
                    for (var i = 0; i < messages.length; i++) {
                        show_message(messages[i], is_error);
                    }
                } else {
                    show_message(messages, is_error);
                }
            });
        }).on('reset', function () {
            $form.data('has_errors', 0).data('success', 0);
        });
        return this;
    };
}(jQuery));