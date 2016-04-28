/**
* Dokumentacja
* 
* isLogged() - zwraca true, jeśli użytkownik jest zalogowany, false w przeciwnym przypadku
* doLogin(user, password, loginUrl) - wysyła żądanie logowania, zwraca promise lub błąd
* doLogout() - kasuje ciasteczko, zwraca true (sukces) lub false
* 
*/
(function() {
  'use strict';
  angular
  .module('login')
  .service('LoginService', LoginService);

  /** ngInject */
  function LoginService($http, $log, $q, LoginHelperService) {
    var loginService = {
      doLogin: doLogin
    };
    return loginService;

    function doLogin(user, pass, loginUrl) {
      var token = btoa(user + ":" + pass);
      var method = "GET";
      setHeader(token);
      var loginResponse = $http({method: method, url: loginUrl})
        .then(
          function successCallback(response) {
            $log.info("S: " + response.code);                       
            return response;
          },
          function errorCallback(response) {
            alert("Logowanie nieudane!\n\nHTTP " + response.status);
            LoginHelperService.setCookie();
            return $q.reject(response);
          });
      return loginResponse;
    }

    function setHeader(token) {
      $http.defaults.headers.common.Authorization = "Basic " + token;
    }

  }
})();
