<?php
require_once 'vendor/autoload.php';
require_once 'core/Album.php';
require_once 'core/cache.class.php';

$app = new \Slim\Slim(array(
        'mode' => 'development',
        'templates.path' => './templates'
    )
);

$app->get('/musics/', function () use ($app) {

    $response = $app->response();
    $response['Content-Type'] = 'application/json';

    $c = new Cache();

    $nameCache = 'newcache';
    if ($c->isCached($nameCache)) {
        $result = $c->retrieve($nameCache);
        $response->body(json_encode($result));
    } else {

        $album = new Album('./mus');
        $albuns = array();

        $parent = 0;
        $children = 0;

        foreach($album->showFiles() as $album => $musics){
            $albuns[] = array('id'=>"parent_{$parent}", 'parent'=>'#', 'text'=>strtoupper($album));
            if(is_array($musics) && count($musics)){
                foreach($musics as $music){
                    $albunsM["parent_{$parent}"][] = array('id'=>"children_{$children}",'parent'=>"parent_{$parent}",'text'=> basename($music['music']),'icon'=>'glyphicon glyphicon-music','a_attr'=> array('href'=>$music['music']));
                    $children++;
                }    
            }
            $parent++;
        }

        $albumSorted = array_orderby($albuns, 'text', SORT_ASC);

        $cont = 0;
        foreach($albumSorted as $alb){
            $arrayzudo[] = $alb;
            $t = $albunsM[$alb['id']];
            $sorted = array_orderby($t, 'text', SORT_ASC);
            foreach($sorted as $sort){
                $sort['id'] = "children_{$cont}";
                $arrayzudo[] = $sort;
                $cont++;
            }
        }

        $c->store($nameCache, $arrayzudo);
        $response->body(json_encode($arrayzudo));
    }

});

$app->get('/download/:music', function ($musica) {
    $arquivo = $musica;
    switch (strtolower(substr(strrchr(basename($arquivo), "."), 1))) {
        case "mp3":
            $tipo = "audio/mpeg";
            break;
    }

    header("Content-Type: " . $tipo);
    header("Content-Length: " . filesize($arquivo));
    header("Content-Disposition: attachment; filename=" . basename($arquivo));
    readfile($arquivo);
    exit;
})->conditions(array('music' => '.+'));;

$app->run();

function array_orderby()
{
    $args = func_get_args();
    $data = array_shift($args);
    foreach ($args as $n => $field) {
        if (is_string($field)) {
            $tmp = array();
            foreach ($data as $key => $row)
                $tmp[$key] = $row[$field];
            $args[$n] = $tmp;
        }
    }
    $args[] = &$data;
    call_user_func_array('array_multisort', $args);
    return array_pop($args);
}