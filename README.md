Dyndrop Console
===============

Administrative web interface for users to manage their Drupal apps.

Installation
------------

Requirements: Drush 5.x http://drupal.org/project/drush

  git clone git@github.com:dyndrop/dyndrop-console.git
  mkdir /some/path
  cd /some/path
  drush make /path/to/dyndrop-console/dyndrop-console.make
  drush site-install dyndrop_console --db-url=mysql://login:password@localhost/dyndrop_console2
