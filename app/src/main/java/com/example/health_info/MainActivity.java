package com.example.health_info;

import androidx.appcompat.app.AppCompatActivity;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

public class MainActivity extends AppCompatActivity {

    private WebView infosaude;


    @Override
    protected void onCreate(Bundle savedInstanceState) {

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        super.onCreate(savedInstanceState);


        setContentView(R.layout.activity_main);


        infosaude = findViewById(R.id.site);
        infosaude.getSettings().setJavaScriptEnabled(true);
        infosaude.setFocusable(true);
        infosaude.getSettings().setCacheMode(WebSettings.LOAD_NO_CACHE);
        infosaude.getSettings().setDomStorageEnabled(true);
        infosaude.getSettings().setAppCacheEnabled(true);
        infosaude.setWebViewClient(new WebViewClient());
        infosaude.loadUrl("http://infosaude.gq/");
    }



}
