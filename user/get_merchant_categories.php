<?php
include 'callAPI.php';
include 'admin_token.php';
$contentBodyJson = file_get_contents('php://input');
$content = json_decode($contentBodyJson, true);
$keyword = $content['keyword'];

$baseUrl = getMarketplaceBaseUrl();
$admin_token = getAdminToken();


$url = $baseUrl . '/api/v2/users/';
$result = callAPI("GET", $admin_token['access_token'], $url, false);
$admin_id = $result['ID'];

$userToken = $_COOKIE["webapitoken"];

$url = $baseUrl . '/api/v2/users/'; 
$result = callAPI("GET", $userToken, $url, false);
$userId = $result['ID'];

//get the item details

$url =  $baseUrl . '/api/v2/admins/'. $admin_id .'/custom-field-definitions';
error_log($url);
$categories = callAPI("GET", $admin_token['access_token'], $url, false);
error_log($categories);
echo json_encode(['result' => $categories]);

?>