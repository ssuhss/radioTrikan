<?php 
class Album
{
    public static $musics = array();
    public static $categories = array();
    public static $sobcategory;
    public static $key = 0;
    public $path;

    public function __construct($path){
        $this->path = $path;
    }

    function showFiles(){
        
        $path = $this->path;

        if (!$path) { return false; }    

        if (is_dir($path)) {
            $dir = opendir($path);

            while ($file = readdir($dir)) {

                if ($file != '.' && $file != '..' && $file != '.htaccess') {
                    Album::$sobcategory = basename($path);
                    Album::$categories[basename($path)] = array('text' => basename($path), 'parent' => $path);

                    $this->path = "{$path}/{$file}";
                    $this->showFiles();
                    
                    unset($file);

                }
            }
            closedir($dir);
            unset($dir);
        }else{
            if( preg_match('/.+(mp3|wav|wma)$/', $path) && is_file($path)){
                Album::$musics[Album::$sobcategory][] = array('music'=> $path);
            }
        }
        ksort(Album::$musics);
        return Album::$musics;
    }
}
?>