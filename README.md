# Hand history converter

[Demo](http://compact.github.io/hand-history-converter/)

## Features

* Supported sites: PokerStars, Full Tilt Poker
* Supported games: Hold'em, Omaha
* Options:
  * Hide usernames (label players by their positions instead)
  * Bets in bb (rather than currency amounts)

## Development

```
npm install -g bower gulp
gem install compass
npm install
bower install

gulp dev            # starts server at localhost:60001 with LiveReload
                    # QUnit tests at localhost:60001/test/
gulp build          # builds to dist/
gulp build-server   # starts server at localhost:60002
```
