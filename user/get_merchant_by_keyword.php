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
if ($keyword) {

    $data = array('keywords'=> $keyword
);    
$search = http_build_query($data);

$url =  $baseUrl . '/api/v2/admins/'. $admin_id .'/users?role=merchant&'. $search;
error_log($url);
$itemDetails = callAPI("GET", $admin_token['access_token'], $url, false);
echo json_encode(['result' => $itemDetails]);
}
?>