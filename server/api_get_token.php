<?php

require 'CONFIG.php';

$client_id = $_GET['client_id'];
$code = $_GET['code'];
$refresh_token = "";

if (empty($code)){
  $refresh_token = $_GET['refresh_token'];
}

function sendPOST($url, $data, $user, $pass){
  $process = curl_init();
  curl_setopt($process, CURLOPT_URL, $url);
  curl_setopt($process, CURLOPT_USERPWD, $user . ":" . $pass);
  curl_setopt($process, CURLOPT_POST, 1);
  curl_setopt($process, CURLOPT_POSTFIELDS, http_build_query($data));
  curl_setopt($process, CURLOPT_RETURNTRANSFER, TRUE);
  $result = curl_exec($process);
  curl_close($process);
  return $result;
}

if (!empty($code)){

  $result = sendPOST('https://bitbucket.org/site/oauth2/access_token', [
    'grant_type' => 'authorization_code',
    'code' => $code,
    ],
    $client_id,
    $CONFIG[$client_id]
  );

  die($result);

}
else if (!empty($refresh_token)){
  $result = sendPOST('https://bitbucket.org/site/oauth2/access_token', [
    'grant_type' => 'refresh_token',
    'refresh_token' => $refresh_token,
    ],
    $client_id,
    $CONFIG[$client_id]
  );

  die($result);
}

 ?>
