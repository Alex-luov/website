$(document).ready(() => {
    let initialData = {};
    let optionsList;
    let pathToData;
    const configBtn = $('#config-ci-runners');
    const viewWrap = $('#partial-ci-runners');

    if (window.location.search) {
        let urlParams = window.location.search.slice(1);
        const params = urlParams.split('&');
        const initPathToData = params.join('_');

        params.forEach((parameter) => {
            const paramCortege = parameter.split('-');
            initialData[paramCortege[0]] = paramCortege[1];
        })

        getData(`configurator-data.json`).then(res => {
            if (res[initPathToData].page) {
                $.ajax({
                    type: "GET",
                    url: `${res[initPathToData].page}`,
                    success: function (response) {
                        $('#configurator-content').html(response);
                    }
                })
            }
        })
    }

    disableAllButtons();

    getData('configurator-options-list.json').then(res => {
        optionsList = res;
        disabledOptions(optionsList);
        removeActive();
    });

    if (Object.keys(initialData).length) {
        for (const key in initialData) {
            $(`.button__wrap.button--${key}`).removeClass('disabled');
            const buttons = $('.button__wrap').find(`[data-key="${key}"]`);

            buttons.each((_, button) => {
                $(button).removeClass('active');
                if ($(button).attr('data-value') === initialData[key])
                    $(button).addClass('active');
            })
        }
        removeActive();
    }

    function getDataFromHTML() {
        const data = {};
        $('.btn.active').each((_, btn) => {
            if ($(btn).attr('data-key')) {
                const key = $(btn).attr('data-key');
                data[key] = $(btn).attr('data-value');
            }
        })
        return data;
    }

    function disableAllButtons() {
        $('.button__wrap').each((_, item) => {
            $(item).addClass('disabled');
        })
    }

    function removeActive() {
        $('.button__wrap.disabled').find('.btn.btn_o.active').removeClass('active');
    }

    function disabledOptions(options) {
        const buttons = $('.button__wrap').find(`[data-key="${options['option']}"]`);

        if (typeof options['values'] === 'object' && Object.keys(options['values']).length) {
            $(`.button__wrap.button--${options['option']}`).removeClass('disabled');

            buttons.each((_, item) => {
                $(item).addClass('disabled');
            })

            for (const valuesKey in options['values']) {
                if ($('.button__wrap').find(`[data-key="${options['option']}"][data-value="${valuesKey}"]`)) {
                    $('.button__wrap').find(`[data-key="${options['option']}"][data-value="${valuesKey}"]`).removeClass('disabled');
                }
            }

            if (Object.keys(options['values']).length) {
                if ($('.button__wrap').find('.active.disabled').length) {
                    buttons.filter('.btn.btn_o:not(.disabled)').first().addClass('active');
                    $('.button__wrap').find('.active.disabled').removeClass('active');
                    getDataFromHTML();
                } else if (buttons.filter('.active').length === 0) {
                    buttons.filter('.btn.btn_o:not(.disabled)').first().addClass('active');
                }
            }
        }
        if (typeof options['values'] === 'object' && Object.keys(options['values']).length) {
            const activeOption = buttons.filter('.btn.btn_o.active').attr('data-value');

            disabledOptions(options['values'][activeOption]);
        }
    }

    function setParams() {
        let params = '';

        for (const key in getDataFromHTML()) {
            params += `${key}-${getDataFromHTML()[key]}&`
        }
        return params.slice(0, -1);
    }

    $('.button__wrap').each((_, item) => {
        $(item).click((e) => {
            e.preventDefault();

            if ($(e.target).hasClass('btn')) {
                setActive(e.target, e.currentTarget);

                disableAllButtons();
                disabledOptions(optionsList);
                removeActive();
                pathToData = getUrl(getDataFromHTML(), e.target);
                const url = new URL(window.location);
                window.history.replaceState(null, null, `${url.pathname}?${setParams()}`);

                getData(`configurator-data.json`).then(res => {
                    if (res[pathToData].page) {
                        $.ajax({
                            type: "GET",
                            url: `${res[pathToData].page}`,
                            success: function (response) {
                                $('#configurator-content').html(response);
                            }
                        })
                    }
                })
            }
        })
    })

    $('.configurator__views-buttons').click((e) => {
        e.preventDefault();

        $('#view__wrap').find('[data-view-content]').removeClass('active');
        if ($(e.target).hasClass('btn')) {
            const btnAttr = $(e.target).attr('data-view-button');
            $(e.target).addClass('active');
            $(`[data-view-content = ${btnAttr}]`).addClass('active');
        }

        setActive(e.target, e.currentTarget);
    });

    $('#project-config').click((e) => {
        e.preventDefault();

        getData(`configurator-data.json`).then(res => {
            setRepoPath(res[pathToData].repo);
        })
    })

    configBtn.click((e) => {
        e.preventDefault();

        let str = '';
        const obj = getDataFromHTML();

        for (const key in obj) {
            // const value = obj[key].split(' ').join('-');

            str += `${key}-${obj[key]}_`
        }
        str = str.slice(0, -1);

        getData(`configurator-data.json`).then(res => {
            viewWrap.text(res[str].settings);
        })
    })

    async function getData(url) {
        const result = await fetch(url)
        const data = await result.json()
        return data
    }
})

function getUrl(obj, target) {
    let str = '';
    const key = $(target).attr('data-key');
    obj[key] = $(target).attr('data-value');

    for (const key in obj) {
        // const value = obj[key].split(' ').join('-');

        str += `${key}-${obj[key]}_`
    }
    str = str.slice(0, -1);
    return str;
}

function setActive(target, currentTarget) {
    if ($(target).hasClass('btn')) {
        $(currentTarget).find('a.btn').removeClass('active');
        $(target).addClass('active');
    }
}