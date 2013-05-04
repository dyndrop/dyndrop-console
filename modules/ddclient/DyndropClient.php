<?php

class DyndropApp {
  public $name;
  public $uris;

  public function __construct($name, $uris) {
    $this->name = $name;
    $this->uris = $uris;
  }
}

class DyndropUser {
  public $email;
  public $name;

  public function __construct($email, $name) {
    $this->email = $email;
    $this->name = $name;
  }
}

class DyndropClient {
  static public $auth_token;
  private $proxy_user;
  private $client;

  /**
   * Lookup a user
   */
  public function user_lookup($email) {
    try {
      return $this->client->get("/1/users/" . $email);
    }
    catch(HTTPClientException $e) {
      return NULL;
    }
  }

  /**
   * Register a user
   */
  public function user_register(DyndropUser $user, $password) {
    $data = array(
      "email" => $user->email,
      "name" => $user->name,
      "password" => $password,
    );
    try {
      $this->client->post("/1/users", $data);
      return TRUE;
    }
    catch(HTTPClientException $e) {
      return FALSE;
    }
  }

  /**
   * Udate a user
   */
  public function user_update(DyndropUser $user, $password) {
    $data = array(
      "password" => $password,
      "name" => $user->name
    );
    try {
      $this->client->put("/1/users/" . $user->email, $data);
      return TRUE;
    }
    catch(HTTPClientException $e) {
      return FALSE;
    }
  }

  /**
   * Login and get a authentification token.
   */
  public function user_authentificate($email, $password) {
    $result = false;
    
    if(empty($email) || empty($password)) {
      return $result;
    }

    $token = NULL;
    $data = array("password" => $password);
    try {
      $answer = $this->client->post("/1/users/" . $email . "/tokens", $data);
      $token = $answer["token"];
    }
    catch(HTTPClientException $e) {
    }

    if(empty($token)) {
      return $result;
    }

    //We got the token, now save it in the SESSION object
    $_SESSION['ddclient_email'] = $email;
    $_SESSION['ddclient_token'] = $token;

    $result = true;
    return $result;
  }

  /**
   * Get an app
   */
  public function apps() {
    return $this->client->get("/1/apps");
  }

  /**
   * Create an app
   */
  public function app_create(DyndropApp $newapp) {
    $data = array(
      "name" => $newapp->name,
      "type" => "drupal",
      "flavor" => "drupal7",
      "package" => "vanilla",
      "uris" => $newapp->uris,
    );
    return $this->client->post("/1/apps", $data);
  }

  /**
   * @param proxy_user Act as another user.
   */
  public function __construct() {

    //Basic check: If the endpoint and/or token is missing, throw a big warning.
    if(variable_get('pxcf_client_api_endpoint', '') == "" || variable_get('pxcf_client_api_token', '') == "") {
      drupal_set_message(t('The Dyndrop client is not configured! You need to add the endpoint and token infos. Please see the documentation at https://github.com/dyndrop/dyndrop-console'), 'error');
    }

    //Create the HTTP client
    $this->client = new HttpClient(null, new HttpClientBaseFormatter(HttpClientBaseFormatter::FORMAT_JSON), 'DyndropClient::_httpclient_alter');
    $this->client->options['curlopts'][CURLOPT_TIMEOUT] = 10;

    // Load the admin token from the conf
    self::$auth_token = variable_get('pxcf_client_api_token', '');

    //Save the user we proxy commands for
    if(isset($_SESSION['ddclient_email']) && empty($_SESSION['ddclient_email']) == false) {
      $this->proxy_user = $_SESSION['ddclient_email'];
    }

    //Authorization and proxy user
    $this->client->options['curlopts'][CURLOPT_HTTPHEADER][] = 'Authorization: ' . self::$auth_token;
    if(empty($this->proxy_user) == false) {
      $this->client->options['curlopts'][CURLOPT_HTTPHEADER][] = 'Proxy-User: ' . $this->proxy_user;
    }
  }

  /**
   * Private static function to alter the HTTP client of this class
   */
  static function _httpclient_alter($request) {
    $server = variable_get('pxcf_client_api_endpoint', '');
    if(substr($server, -1) == "/") {
      $server = substr($server, 0, strlen($server) - 1);
    }
    $request->url = $server . $request->url;
  }
}
