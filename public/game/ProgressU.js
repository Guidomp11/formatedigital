function UnityProgress(dom) {
    this.progress = 0.0;
    this.message = "";
    this.dom = dom;

    var loadingBox = document.getElementById("loadingBox");
    var bgBar = document.getElementById("bgBar");
    var pbar = document.getElementById("progressBar");
    var loadingText = document.getElementById("loadingText");

    this.SetProgress = function(progress) {
        if (this.progress < progress) {
            this.progress = progress;
        }
        if (progress < 0.5) {
            this.SetMessage("Solicitando...");
        } else if (progress >= 0.5) {
            this.SetMessage("Preparando...");
        } else if (progress == 1) {
            this.SetMessage("Iniciando...");
            bgBar.style.display = "none";
            pbar.style.display = "none";
        }
        this.Update();
    }

    this.SetMessage = function(message) {
        this.message = message;
        this.Update();
    }

    this.Clear = function() {
        loadingBox.style.display = "none";
    }

    this.Update = function() {
        var length = 200 * Math.min(this.progress, 1);
        pbar.style.width = length + "px";
        loadingText.innerHTML = this.message;
    }

    this.Update();
}
