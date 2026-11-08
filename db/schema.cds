namespace dino.game;

entity Characters {
  key id                    : UUID @title: '{i18n>characterId}';
      name                  : String @title: '{i18n>characterName}';
      idle_image            : LargeBinary @title: '{i18n>idleImage}' @Core.MediaType: idle_image_mediaType @UI.IsImage;
      idle_image_mediaType  : String @title: '{i18n>idleImageMediaType}' @Core.IsMediaType;
      run_1_image           : LargeBinary @title: '{i18n>runImage1}' @Core.MediaType: run_1_image_mediaType @UI.IsImage;
      run_1_image_mediaType : String @title: '{i18n>runImage1MediaType}' @Core.IsMediaType;
      run_2_image           : LargeBinary @title: '{i18n>runImage2}' @Core.MediaType: run_2_image_mediaType @UI.IsImage;
      run_2_image_mediaType : String @title: '{i18n>runImage2MediaType}' @Core.IsMediaType;
      jump_image            : LargeBinary @title: '{i18n>jumpImage}' @Core.MediaType: jump_image_mediaType @UI.IsImage;
      jump_image_mediaType  : String @title: '{i18n>jumpImageMediaType}' @Core.IsMediaType;
      crash_image           : LargeBinary @title: '{i18n>crashImage}' @Core.MediaType: crash_image_mediaType @UI.IsImage;
      crash_image_mediaType : String @title: '{i18n>crashImageMediaType}' @Core.IsMediaType;
}
