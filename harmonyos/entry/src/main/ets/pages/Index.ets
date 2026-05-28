import { webview } from '@kit.ArkWeb';

@Entry
@Component
struct Index {
  controller: webview.WebviewController = new webview.WebviewController();
  @State loading: boolean = true;

  aboutToAppear() {
    // 启用 Web 调试（仅在 debug 模式）
    webview.WebviewController.setWebDebuggingAccess(true);
  }

  build() {
    Stack() {
      Web({ src: 'http://118.31.109.161:8082', controller: this.controller })
        .width('100%')
        .height('100%')
        .javaScriptAccess(true)
        .domStorageAccess(true)
        .mixedMode(MixedMode.All)
        .zoomAccess(false)
        .overviewModeAccess(true)
        .onPageEnd(() => {
          this.loading = false;
        })
        .onErrorReceive((event) => {
          if (event) {
            console.error('WebView error: ' + JSON.stringify(event));
          }
        })

      // 加载指示器
      if (this.loading) {
        LoadingProgress()
          .width(36)
          .height(36)
          .color('#1976d2')
      }
    }
    .width('100%')
    .height('100%')
  }
}
