# -*- coding: utf-8 -*-
import os


def logMsg(string):
  return string

from mitmproxy import proxy, options
from mitmproxy.tools.dump import DumpMaster
from mitmproxy import ctx, http

import re
import sys
if sys.version_info[0] < 3:
    print("Python 3 or a more recent version is required. (Tested with 3.8)")
    sys.exit(1)
if sys.version_info[1] != 8:
  print(f"This script has been tested only on Python 3.8, you're using 3.{sys.version_info[1]}, be wary of any errors.")

# START A BUNCH OF WINDOWS STUFF THAT MIGHT BREAK ON MACOS OR LINUX
if os.name == 'nt':
  print("The script is running on Windows, system's proxy setting will be automatically configured to 127.0.0.1:8088 .")
  import winreg

  WIN_PROXY = u'127.0.0.1:8088'

  from ctypes import *
  from ctypes.wintypes import *

  LPWSTR = POINTER(WCHAR)
  HINTERNET = LPVOID

  INTERNET_PER_CONN_PROXY_SERVER = 2
  INTERNET_OPTION_REFRESH = 37
  INTERNET_OPTION_SETTINGS_CHANGED = 39
  INTERNET_OPTION_PER_CONNECTION_OPTION = 75
  INTERNET_PER_CONN_PROXY_BYPASS = 3
  INTERNET_PER_CONN_FLAGS = 1

  class INTERNET_PER_CONN_OPTION(Structure):
      class Value(Union):
          _fields_ = [
              ('dwValue', DWORD),
              ('pszValue', LPWSTR),
              ('ftValue', FILETIME),
          ]

      _fields_ = [
          ('dwOption', DWORD),
          ('Value', Value),
      ]

  class INTERNET_PER_CONN_OPTION_LIST(Structure):
      _fields_ = [
          ('dwSize', DWORD),
          ('pszConnection', LPWSTR),
          ('dwOptionCount', DWORD),
          ('dwOptionError', DWORD),
          ('pOptions', POINTER(INTERNET_PER_CONN_OPTION)),
      ]

  def set_proxy_settings(ip, port, on=True):
      """
      #Some Windows 10 weird stuff to configure the proxy
      """
      if on:
          setting = create_unicode_buffer(ip+":"+str(port))
      else:
          setting = None

      InternetSetOption = windll.wininet.InternetSetOptionW
      InternetSetOption.argtypes = [HINTERNET, DWORD, LPVOID, DWORD]
      InternetSetOption.restype  = BOOL

      List = INTERNET_PER_CONN_OPTION_LIST()
      Option = (INTERNET_PER_CONN_OPTION * 3)()
      nSize = c_ulong(sizeof(INTERNET_PER_CONN_OPTION_LIST))

      Option[0].dwOption = INTERNET_PER_CONN_FLAGS
      Option[0].Value.dwValue = (2 if on else 1) # PROXY_TYPE_DIRECT Or 
      Option[1].dwOption = INTERNET_PER_CONN_PROXY_SERVER
      Option[1].Value.pszValue = setting
      Option[2].dwOption = INTERNET_PER_CONN_PROXY_BYPASS
      Option[2].Value.pszValue = create_unicode_buffer("localhost;127.*;10.*;172.16.*;172.17.*;172.18.*;172.19.*;172.20.*;172.21.*;172.22.*;172.23.*;172.24.*;172.25.*;172.26.*;172.27.*;172.28.*;172.29.*;172.30.*;172.31.*;172.32.*;192.168.*")

      List.dwSize = sizeof(INTERNET_PER_CONN_OPTION_LIST)
      List.pszConnection = None
      List.dwOptionCount = 3
      List.dwOptionError = 0
      List.pOptions = Option

      InternetSetOption(None, INTERNET_OPTION_PER_CONNECTION_OPTION, byref(List), nSize)
      InternetSetOption(None, INTERNET_OPTION_SETTINGS_CHANGED, None, 0)
      InternetSetOption(None, INTERNET_OPTION_REFRESH, None, 0)
else:
  print("The script is not running on Windows.")
  print("Make sure to setup your connection with the proxy stated at 'Proxy server listening at http://###.###.###.###:####'.")
  input("Press any key to continue.")

# END A BUNCH OF WINDOWS STUFF THAT MIGHT BREAK ON MACOS OR LINUX

    
class Altador_Proxy:
  
  def __init__(self):
    self.telescope_page = "//www.neopets.com/altador/hallofheroes.phtml?stairs=1&telescope=1"
    # The flashRIP__2020 notice
    self.old_telescope_content = re.compile("<div align=\"center\">[\s\S]+?<\/div>[\s]+?<br>[\s]+?<b>Note:<\/b>",flags=re.IGNORECASE)
    self.old_telescope_content = re.compile("<div align=\"center\">[\s\S]+?<\/div><br><b>Note:<\/b>",flags=re.IGNORECASE)
    self.new_telescope_content = """
              <div align="center">
                <script src="./assets/js/observatory.js" type="text/javascript" charset="utf-8" async defer></script>
                <link href="./assets/css/observatory.css" type="text/css" rel="stylesheet">
                <div id="telescope-container">
                  <img id="telescope-outer" src="./assets/img/telescope_outer.png" alt="Telescope White">
                  <img id="telescope-ring" src="./assets/img/telescope_ring.png" alt="Telescope Ring">
                  <div id="stars"></div>
                  <div class="hair" id="crosshair-v"></div>
                  <div class="hair" id="crosshair-h"></div>
                  <div id="options-button-container">
                    <img id="button-image" src="./assets/img/full_button.png" alt="Options Button">
                    <div id="button-area"></div>
                  </div>
                  <div id="scroll-container">
                    <img id="scroll-top" src="./assets/img/scroll_top.png">
                    <div id="scroll-middle-content">
                      <img id="scroll-middle" src="./assets/img/scroll_middle.png">
                      <ul id="options-list">
                        <li id="option-add">ADD STAR</li>
                        <li id="option-connect">CONNECT STARS</li>
                        <li id="option-delete">DELETE STAR</li>
                        <li id="option-delete-all">DELETE ALL</li>
                      </ul>
                    </div>
                    <img id="scroll-bottom" src="./assets/img/scroll_bottom.png">
                  </div>
                  <div id="submit-popup-container">
                    <img id="submit-popup-arm-small" src="./assets/img/submit_arm_small.png">
                    <img id="submit-popup-arm-big" src="./assets/img/submit_arm_big.png">
                    <p id="submit-popup-panel">SUBMIT</p>
                  </div>
                  <div id="scroll-popup-container">
                    <p class="scroll-popup-text checking">
                      <span class="scroll-popup-text-top">DOUBLE-CHECKING<br>ASTRONOMICAL DATA...</span>
                    </p>
                    <p class="scroll-popup-text error">
                      <span class="scroll-popup-text-top">IT LOOKS LIKE THOSE<br>STARS DON'T MATCH<br>ANY CONSTELLATIONS.</span>
                      <span class="scroll-popup-text-bottom">CONTINUE</span>
                    </p>
                    <p class="scroll-popup-text success">
                      <span class="scroll-popup-text-top">CONGRATULATIONS<br>YOU'VE IDENTIFIED A<br>NEW CONSTELLATION!</span>
                      <span class="scroll-popup-text-bottom">CONTINUE</span>
                    </p>
                  </div>
                  <div id="current-coords-container">
                    <img id="current-coords-image" src="./assets/img/current_coords.png">
                    <p id="current-coords-text">0,0</p>
                  </div>
                  <span id="tooltip" class="debug-output">
                    Shown Coords (<span id="x-coords"></span>,<span id="y-coords"></span>)
                    <br>
                    Div Coords (<span id="x-coords-debug"></span>,<span id="y-coords-debug"></span>)
                    <br>
                  </span>
                </div>
              </div><br><b>Note:</b>"""
  
  def request(self, flow):
    if flow.request.pretty_host == "www.neopets.com":
      if "/assets/" in flow.request.pretty_url:
        filename = flow.request.path.replace("/altador/","./")
        file_content = open(filename, "rb").read()
        flow.response = http.HTTPResponse.make(
            200,
            file_content
        )
        
        if "/assets/js" in flow.request.pretty_url:
          flow.response.headers['Content-Type'] = 'text/javascript'
        if "/assets/css" in flow.request.pretty_url:
          flow.response.headers['Content-Type'] = 'text/css'
        if "/assets/img" in flow.request.pretty_url:
          flow.response.headers['Content-Type'] = 'image/png'
        if "/assets/fonts" in flow.request.pretty_url:
          flow.response.headers['Content-Type'] = 'application/font-sfnt'
        if "/assets/sounds" in flow.request.pretty_url:
          flow.response.headers['Content-Type'] = 'audio/mpeg'
      
      
        
  def response(self, flow):
    if flow.request.pretty_host == "www.neopets.com":
      if self.telescope_page in flow.request.pretty_url:
        flow.response.text = self.old_telescope_content.sub(self.new_telescope_content,flow.response.text)
      

addons = [
    Altador_Proxy()
  ]


def main():
  addons = [
    Altador_Proxy()
  ]


  opts = options.Options(listen_host='127.0.0.1', listen_port=8088)
  opts.allow_hosts = ["images.neopets.com","www.neopets.com","www.google.com"]
  opts.add_option("body_size_limit", int, 0, "")
  # Not sure if this has to be changed now that https is a thing
  opts.add_option("ssl_insecure",bool,True,"")
  pconf = proxy.config.ProxyConfig(opts)

  m = DumpMaster(None)
  m.server = proxy.server.ProxyServer(pconf)
  for addon in addons:
    m.addons.add(addon)

  try:
    print(logMsg("--------------------------------------------------------------------------------------------------------"))
    print(logMsg("STARTING PROXY"))
    m.run()
  except KeyboardInterrupt:
    print(logMsg("SHUTTING DOWN PROXY"))
    m.shutdown()
  except Exception as e:
    print(logMsg(e))
  finally:
    print(logMsg("EXITING PROGRAM"))

if __name__ == "__main__":
  if os.name == 'nt':
    set_proxy_settings("127.0.0.1", 8088)
  main()
  if os.name == 'nt':
    set_proxy_settings("127.0.0.1", 8088, False)
