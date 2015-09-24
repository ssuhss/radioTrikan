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

    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }

    if ($ip == '') {
        $ip = 'no-ip';
    }


    $response = $app->response();
    $response['Content-Type'] = 'application/json';
    $c = new Cache();

    //$arquivo = './Playlists/' . $ip . ".txt";
    $arquivo = './Playlists/'.$ip . ".txt";
    $arquivo = file("$arquivo");
    if ($arquivo) {
        $children = 0;
        $list[] = array('id' => "parent_0", 'parent' => '#', 'text' => strtoupper('Favoritos'));

        foreach ($arquivo as $url) {
            $list[] = array('id' => "children_{$children}", 'parent' => "parent_0", 'text' => basename(trim($url)), 'icon' => 'glyphicon glyphicon-music', 'a_attr' => array('href' => trim($url)));
            $children++;
        }
    }

    //var_dump($list);
//exit;

    $response->body(json_encode($list));

});

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