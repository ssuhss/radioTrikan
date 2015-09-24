$(function () {

    var $playlistFav = $("#playlistFav");
    $playlistFav.jstree({
        'core': {
            'data': {
                'url': function (node) {
                    return node.id === '#' ?
                        'rest/indexFav.php/musics' : false;
                },
                'data': function (node) {
                    return {'id': node.id};
                }
            },
            'multiple': false
        }
    });

    var link;
    var to = false;
    var linkAntigo;


    $playlistFav.on("select_node.jstree", function (e, data) {

        $(".controles").hide();
        $('#player').hide();
        $("#player").trigger('pause');
        $('#playerFav').show();

        var idElement = data.selected[0];
        $(this).jstree('toggle_node', idElement);

        if (playerFav.isMusic(idElement)) {
            var element = playerFav.getElementById(idElement);
            $(this).jstree('select_node', idElement);
            playerFav.play(element);
        }
    });

    $playlistFav.on('ready.jstree', function (e, data) {
        $(this).jstree('open_all');
        var allData = data.instance._model.data;
        var musics = [];

        if (allData) {

            $.each(allData, function (id, obj) {
                if (playerFav.isMusic(id)) {
                    musics.push(obj);
                }
            });

        }

        if (musics.length) {
            playerFav.setMusics(musics);
            playerFav.init();
        }
    });


});

var playerFav = (function () {
    var moduleFav = {
        baseUrl: 'rest/',
        prefixChildren: 'children_',
        $btnext: null,
        $btprev: null,
        $btfav: null,
        $musicTitle: null,
        $player: null,
        $source: null,
        musics: null,
        currentIndex: null,
        current: null,
        $jstree: null,
        lastItem: null,
        totalSeach: 0,
        init: function () {
            moduleFav.$source = $('#sourceFav');
            moduleFav.$musicTitle = $('#musicTitle');
            moduleFav.$player = $('#playerFav');
            moduleFav.$jstree = $('#playlistFav').jstree(true);
            moduleFav.$btnext = $('#btnextFav');
            moduleFav.$btprev = $('#btprevFav');

            var location_param = window.location.search;
            var indexInit = 0;
            if (location_param.indexOf('?') != -1) {
                var n = location_param.split('=').pop();
                indexInit = n > (moduleFav.musics.length - 1) || n < 0 ? 0 : n;
            }
            //moduleFav.play(moduleFav.musics[indexInit]);
            moduleFav.bindEnded();
            moduleFav.bindButtons();
            moduleFav.arrows();
            //moduleFav.$player.hide();
            //moduleFav.fav();
        },
        fav: function () {

        },
        arrows: function () {

            var pressedCtrl = false;

            $(document).keyup(function (e) {
                if (e.which == 17) {
                    pressedCtrl = false;
                }
            });

            $(document).keydown(function (e) {
                console.log(e.which);
                if (e.which == 17) {
                    pressedCtrl = true;
                }

                if (pressedCtrl) {
                    switch (e.which) {
                        case 37:
                            moduleFav.bindPrev();
                            break;
                        case 39:
                            moduleFav.nextAutomatic();
                            break;
                        case 67:
                            console.log('entrou');

                            break;
                        default:
                            return;
                    }
                    e.preventDefault();
                }
            });
        },
        isMusic: function (id) {
            if (id.indexOf("child") != -1)
                return true;
            else
                return false;
        },
        bindButtons: function () {
            moduleFav.$btnext.on('click', function () {
                moduleFav.nextAutomatic();
            });
            moduleFav.$btprev.on('click', function () {
                moduleFav.bindPrev();
            });

        },
        bindFav: function () {

            $.ajax({
                method: "POST",
                url: "rest/core/ajax.php",
                data: {action: "addFav", musica: moduleFav.current['a_attr'].href}
            }).done(function (data) {
            });

            //return false;
        },
        bindPrev: function () {
            moduleFav.deselect_nodes();
            if (moduleFav.existPrev()) {
                moduleFav.play(moduleFav.prev());
            } else {
                moduleFav.play(moduleFav.musics[moduleFav.musics.length - 1]);
            }
        },
        deselect_nodes: function () {
            var tree = moduleFav.$jstree;
            var selecteds = tree.get_selected();
            tree.deselect_node(selecteds);
        },
        bindEnded: function () {
            moduleFav.$player.on('ended', function () {
                moduleFav.nextAutomatic();
            });
        },
        nextAutomatic: function () {
            moduleFav.deselect_nodes();
            if (moduleFav.existNext()) {
                moduleFav.play(moduleFav.next());
            } else {
                moduleFav.play(moduleFav.musics[0]);
            }
        },
        existNext: function () {
            if (moduleFav.currentIndex == (moduleFav.musics.length - 1)) {
                return false;
            } else {
                return true;
            }
        },
        existPrev: function () {
            if (moduleFav.currentIndex == 0) {
                return false;
            } else {
                return true;
            }
        },
        prev: function () {
            var keys = Object.keys(moduleFav.musics);
            var i = keys.indexOf(moduleFav.currentIndex);
            return i !== -1 && keys[i--] && moduleFav.musics[keys[i--]];
        },
        setCurrent: function (element) {
            moduleFav.currentIndex = moduleFav.getIdByElement(element);
            moduleFav.current = element;
            var jstree = moduleFav.$jstree;
            //jstree.select_node(moduleFav.prefixChildren + moduleFav.currentIndex);

        },
        getElementById: function (id) {
            for (i in moduleFav.musics) {
                if (moduleFav.musics[i].id.indexOf(id) != -1) {
                    return moduleFav.musics[i];
                }
            }
        },
        next: function () {
            var keys = Object.keys(moduleFav.musics);
            var i = keys.indexOf(moduleFav.currentIndex);
            return i !== -1 && keys[i++] && moduleFav.musics[keys[i++]];
        },
        setMusics: function (musics) {
            moduleFav.musics = musics;
        },
        play: function (element) {
            moduleFav.selectMusic(element);
        },
        selectMusic: function (element) {
            var path = element['a_attr'].href;
            //$('#btDownload').attr('href', 'rest/download/' + path);
            moduleFav.$source.attr("src", moduleFav.baseUrl + path);
            moduleFav.$player.load();
            moduleFav.setCurrent(element);
            moduleFav.setTitle();
        },
        setTitle: function () {
            moduleFav.$musicTitle.html(moduleFav.current.text);
        },
        getIdByElement: function (element) {
            return element.id.split('_').pop();
        },

        countSearch: function () {
            var totalAtual = $('a.jstree-search').length;
            var $totalSearch = $('#totalSearch');

            if (totalAtual > 0 && totalAtual != moduleFav.totalSeach) {
                var plural = totalAtual > 1 ? ' músicas encontradas' : ' música encontrada';
                $totalSearch.html(totalAtual + plural).css('visibility', 'visible');
            } else {
                $totalSearch.css('visibility', 'hidden');
            }

        }
    }

    return {
        init: moduleFav.init,
        setMusics: moduleFav.setMusics,
        isMusic: moduleFav.isMusic,
        play: moduleFav.play,
        getElementById: moduleFav.getElementById,
        countSearch: moduleFav.countSearch,
        deselect_nodes: moduleFav.deselect_nodes
    }

}());
