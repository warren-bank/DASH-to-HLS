### [dash-to-hls](https://github.com/warren-bank/DASH-to-HLS)

Node.js server to convert DASH video stream manifests to HLS

- - - -

### Installation and Usage: Globally

#### How to: Install:

```bash
npm install --global "@warren-bank/dash-to-hls"
```

#### How to: Run the server(s):

```bash
dash-to-hls [--help] [--version] [--tls] [--host <ip_address>] [--port <number>] [--req-headers <filepath>] [--origin <header>] [--referer <header>] [--useragent <header>] [--header <name=value>] [--req-options <filepath>] [--req-secure-honor-server-cipher-order] [--req-secure-ciphers <string>] [--req-secure-protocol <string>] [--req-secure-curve <string>] [-v <number>] [--acl-whitelist <ip_address_list>]
```

#### Examples:

1. print help<br>
  `dash-to-hls --help`

2. print version<br>
  `dash-to-hls --version`

3. start HTTP server at default host:port<br>
  `dash-to-hls`

4. start HTTP server at default host and specific port<br>
  `dash-to-hls --port "8080"`

5. start HTTP server at specific host:port<br>
  `dash-to-hls --host "192.168.0.100" --port "8080"`

6. start HTTPS server at default host:port<br>
  `dash-to-hls --tls`

7. start HTTPS server at specific host:port<br>
  `dash-to-hls --tls --host "192.168.0.100" --port "8081"`

8. start HTTPS server at default host:port and send specific HTTP headers<br>
  `dash-to-hls --tls --req-headers "/path/to/request/headers.json"`

#### Options:

* _--tls_ is a flag to start HTTP**S** server, rather than HTTP
* _--host_ must be an IP address of the server
  * ex: `192.168.0.100`
  * used to generate self-referencing URLs in the master HLS manifest to query each child manifest
  * when this option is not specified:
    * the list of available network addresses is determined
    * if there are none, 'localhost' is used silently
    * if there is only a single address on the LAN, it is used silently
    * if there are multiple addresses:
      * they are listed
      * a prompt asks the user to choose (the numeric index) of one
* _--port_ is the port number that the server listens on
  * ex: `8080`
  * used to generate self-referencing URLs in the master HLS manifest to query each child manifest
  * when this option is not specified:
    * HTTP server binds to: `80`
    * HTTPS server binds to: `443`
* _--req-headers_ is the filepath to a JSON data _Object_ containing key:value pairs
  * each _key_ is the name of an HTTP header to send in in every outbound request
* _--origin_ is the value of the corresponding HTTP request header
* _--referer_ is the value of the corresponding HTTP request header
* _--useragent_ is the value of the corresponding HTTP request header
* _--header_ is a single name:value pair
  * this option can be used multiple times to include several HTTP request headers
  * the pair can be written:
    * "name: value"
    * "name=value"
    * "name = value"
* _--req-options_ is the filepath to a JSON data _Object_
  * exposes the options _Object_ passed to low-level network request APIs:
    * [`http.request(options)`](https://nodejs.org/api/http.html#http_http_request_options_callback)
    * [`https.request(options)`](https://nodejs.org/api/https.html#https_https_request_options_callback)
  * advanced __https__ request options:
    * context of the secure request is obtained by passing the request options _Object_ to: [`tls.createSecureContext(options)`](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options)
    * configuration for the context of the secure request can be merged with the request options _Object_
    * configuration keys of particular interest:
      * `honorCipherOrder`
        * default value: `false`
      * `ciphers`
        * default value: [`"ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:DHE-RSA-AES256-SHA384:ECDHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA256:HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA"`](https://nodejs.org/api/tls.html#tls_modifying_the_default_tls_cipher_suite)
      * `secureProtocol`
        * default value: [`"TLS_method"`](https://www.openssl.org/docs/man1.1.0/ssl/ssl.html#Dealing-with-Protocol-Methods)
      * `ecdhCurve`
        * default value: [`tls.DEFAULT_ECDH_CURVE`](https://nodejs.org/api/tls.html#tls_tls_default_ecdh_curve)
          * the exact value depends on the version of node
          * most commonly:
            * older versions of node: `"prime256v1"`
            * newer versions of node: `"auto"`
* _--req-secure-honor-server-cipher-order_ is a flag to set the following key in the request options _Object_ to configure the context for secure __https__ requests:
  * `{honorCipherOrder: true}`
* _--req-secure-ciphers_ is the value to assign to the following key in the request options _Object_ to configure the context for secure __https__ requests:
  * `{ciphers: value}`
* _--req-secure-protocol_ is the value to assign to the following key in the request options _Object_ to configure the context for secure __https__ requests:
  * `{secureProtocol: value}`
* _--req-secure-curve_ is the value to assign to the following key in the request options _Object_ to configure the context for secure __https__ requests:
  * `{ecdhCurve: value}`
* _-v_ sets logging verbosity level:
  * `-1`:
    * silent
  * `0` (default):
    * show errors only
  * `1`:
    * show an informative amount of information
  * `2`:
    * show technical details
  * `3`:
    * show an enhanced technical trace (useful while debugging unexpected behavior)
* _--acl-whitelist_ restricts server access to clients at IP addresses in whitelist
  * ex: `"192.168.1.100,192.168.1.101,192.168.1.102"`

- - - -

### Installation and Usage: Working with a Local `git` Repo

#### How to: Install:

```bash
git clone "https://github.com/warren-bank/DASH-to-HLS.git"
cd "DASH-to-HLS"
npm install
```

#### How to: Run the server(s):

```bash
# ----------------------------------------------------------------------
# If using a port number >= 1024 on Linux, or
# If using Windows:
# ----------------------------------------------------------------------
npm start [-- [--help] [--version] [--tls] [--host <ip_address>] [--port <number>] [--req-headers <filepath>] [--origin <header>] [--referer <header>] [--useragent <header>] [--header <name=value>] [--req-options <filepath>] [--req-secure-honor-server-cipher-order] [--req-secure-ciphers <string>] [--req-secure-protocol <string>] [--req-secure-curve <string>] [-v <number>] ]

# ----------------------------------------------------------------------
# https://www.w3.org/Daemon/User/Installation/PrivilegedPorts.html
#
# Linux considers port numbers < 1024 to be privileged.
# Use "sudo":
# ----------------------------------------------------------------------
npm run sudo [-- [--help] [--version] [--tls] [--host <ip_address>] [--port <number>] [--req-headers <filepath>] [--origin <header>] [--referer <header>] [--useragent <header>] [--header <name=value>] [--req-options <filepath>] [--req-secure-honor-server-cipher-order] [--req-secure-ciphers <string>] [--req-secure-protocol <string>] [--req-secure-curve <string>] [-v <number>] ]
```

#### Examples:

1. print help<br>
  `npm start -- --help`

2. start HTTP server at specific host:port<br>
  `npm start -- --host "192.168.0.100" --port "8080"`

3. start HTTPS server at specific host:port<br>
  `npm start -- --host "192.168.0.100" --port "8081" --tls`

4. start HTTP server at default host:port with escalated privilege<br>
  `npm run sudo -- --port "80"`

5. start HTTPS server at default host:port with escalated privilege<br>
  `npm run sudo -- --port "443" --tls`

6. start HTTP server at specific port and send custom request headers<br>
  ```bash
headers_file="${TMPDIR}/headers.json"
echo '{"Origin" : "http://XXX:80", "Referer": "http://XXX:80/page.html"}' > "$headers_file"
npm start -- --port "8080" --req-headers "$headers_file"
```

7. start HTTPS server at specific port and send custom request headers<br>
  ```bash
headers_file="${TMPDIR}/headers.json"
echo '{"Origin" : "http://XXX:80", "Referer": "http://XXX:80/page.html"}' > "$headers_file"
npm start -- --port "8081" --req-headers "$headers_file" --tls -v 1
```

8. start HTTPS server at specific port and send custom request headers<br>
  ```bash
h_origin='http://XXX:80'
h_referer='http://XXX:80/page.html'
h_useragent='Chromium'
h_custom_1='X-Foo: 123'
h_custom_2='X-Bar: baz'
npm start -- --port "8081" --origin "$h_origin" --referer "$h_referer" --useragent "$h_useragent" --header "$h_custom_1" --header "$h_custom_2" --tls -v 1
```

#### Options:

* identical to the [command-line binary](#installation-and-usage-globally)

- - - -

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
