<?php

if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
    $ip = $_SERVER['HTTP_CLIENT_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
} else {
    $ip = $_SERVER['REMOTE_ADDR'];
}



if($_POST['action'] == 'init'){
    $arquivo = './../Playlists/'.$ip . ".txt";
    $arquivo = file("$arquivo");
    if(!$arquivo){
        $fp = fopen("./../Playlists/".$ip.".txt", "a+");
        chmod($fp, 0664);
        fclose($fp);
    }
}



if($_POST['action'] == 'add'){
    $local = $_POST['musica'];
    $fp = fopen("./../Playlists/".$ip.".txt", "a+");
    chmod($fp, 0664);
    $escreve = fwrite($fp, $local."\n");
    fclose($fp);
    return true;
}
?>