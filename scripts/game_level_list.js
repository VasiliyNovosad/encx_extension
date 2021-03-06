/*
MIT License

Copyright (c) 2018 Eugene Lapeko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

class GameLevelListManager extends GameManager {
  constructor(){
    super();
    this.activeLevel = -1;
  }

  initialize(storage){
    this.storage = storage;

    if (storage.isStormGame()){
      this.activeLevel = storage.getLevelId();
      $("div.content")
        .append(this._levelListTemplate(storage.getGame()));
    }
  }

  update(storage){
    if (storage.isStormGame()){
      storage.getLevels().forEach(
        function(level){
          if (this.storage.isLevelNew(level.LevelId)){
            $("#level-list ul").append(this._levelTemplate(level))
          } else if (this.storage.isLevelChanged(level.LevelId)) {
            $(`#level-${level.LevelId}`)
              .replaceWith(this._levelTemplate(level));
          }
        },
        this
      );

      if (storage.isLevelUp()){
        this._scrollToActive();
      }
    }
  }

  _levelListTemplate (game){
    return $("<div>")
      .attr("id", "level-list")
      .append(
        $("<a>")
          .addClass("navigation previous")
          .append("&laquo;")
          .click(
            { manager: this },
            this._moveCarousel
          )
          .mouseover(
            { manager: this },
            this._rollCarousel
          )
          .mouseout(
            { manager: this },
            this._unrollCarousel
          )
      )
      .append(
        $("<a>")
          .addClass("navigation next")
          .append("&raquo;")
          .click(
            { manager: this },
            this._moveCarousel
          )
          .mouseover(
            { manager: this },
            this._rollCarousel
          )
          .mouseout(
            { manager: this },
            this._unrollCarousel
          )
      )
      .append(
        $("<ul>")
      );
  }

  _levelTemplate (level){
    return $("<li>")
      .addClass("level-block")
      .addClass(this.activeLevel == level.LevelId ? "level-active" : "")
      .addClass(level.Dismissed == true ? "level-dismissed" : "")
      .addClass(level.IsPassed == true ? "level-finished" : "")
      .attr("level-number", level.LevelNumber)
      .attr("level-id", level.LevelId)
      .attr("id", `level-${level.LevelId}`)
      .append(
        $("<i>")
          .append(level.LevelNumber)
      )
      .append(
        $("<div>")
          .addClass("line")
      )
      .append(
        $("<p>")
          .append(level.LevelName)
      )
      .click(
        { storage: this.storage },
        function(event){
          $(".level-block").removeClass("level-active");
          $(this).addClass("level-active");
          event.data.storage.changeLevel(
            $(this).attr('level-id'),
            $(this).attr('level-number')
          )
        }
      );
  }

  _rollCarousel(event){
    event.preventDefault();
    event.data.manager.doRoll = setInterval(
      function(){ event.data.manager._moveCarousel(event); },
      300
    );
  }

  _unrollCarousel(event){
    event.preventDefault();
    clearInterval(event.data.manager.doRoll);
  }

  _moveCarousel(event){
    event.preventDefault();

    var margin = parseInt($("#level-list ul").first().css("margin-left")) || 0;

    if (event.target.classList.contains('next')){
      margin -= 100;
    } else {
      margin += 100;
    }

    if (margin > 400 || Math.abs(margin) > event.data.manager._carouselMaxMargin()) return;
    $("#level-list ul").first().css("margin-left", `${margin}px`);
  }

  _carouselMaxMargin(){
    var max_width  = -400;
    $(".level-block").each(function(){ max_width += $(this).width(); });
    return max_width;
  }

  _scrollToActive(){
    var id = $(".level-active").index(),
        margin = 400, i;
    $(`.level-block:lt(${id})`).each(function() {
      margin -= $(this).width();
    });

    if (margin > 300) margin = 299;
    if (margin < -1 * this._carouselMaxMargin()) margin = -1 * this._carouselMaxMargin();

    $("#level-list ul").css("margin-left", `${margin}px`);
  }
};
