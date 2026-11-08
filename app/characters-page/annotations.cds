using DinoService as service from '../../srv/dino-service';

annotate service.Characters with @(
    Common.Label: '{i18n>characters}',
    UI.HeaderInfo: {
        TypeName: '{i18n>character}',
        TypeNamePlural: '{i18n>characters}',
        Title: {
            $Type: 'UI.DataField',
            Value: name,
        },
    },
    UI.FieldGroup #GeneralInformation: {
        $Type: 'UI.FieldGroupType',
        Data : [{
            $Type: 'UI.DataField',
            Label: '{i18n>characterName}',
            Value: name,
        }, ],
    },
    UI.FieldGroup #CharacterImages   : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Label: '{i18n>idleImage}',
                Value: idle_image,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>idleImageMediaType}',
                Value: idle_image_mediaType,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>runImage1}',
                Value: run_1_image,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>runImage1MediaType}',
                Value: run_1_image_mediaType,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>runImage2}',
                Value: run_2_image,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>runImage2MediaType}',
                Value: run_2_image_mediaType,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>jumpImage}',
                Value: jump_image,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>jumpImageMediaType}',
                Value: jump_image_mediaType,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>crashImage}',
                Value: crash_image,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>crashImageMediaType}',
                Value: crash_image_mediaType,
            },
        ],
    },
    UI.Facets                        : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneralInformationFacet',
            Label : '{i18n>generalInformation}',
            Target: '@UI.FieldGroup#GeneralInformation',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'CharacterImagesFacet',
            Label : '{i18n>characterImages}',
            Target: '@UI.FieldGroup#CharacterImages',
        },
    ],
    UI.LineItem                      : [
        {
            $Type: 'UI.DataField',
            Label: '{i18n>characterName}',
            Value: name,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>idleImage}',
            Value: idle_image,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>runImage1}',
            Value: run_1_image,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>runImage2}',
            Value: run_2_image,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>jumpImage}',
            Value: jump_image,
        },
        {
            $Type: 'UI.DataField',
            Label: '{i18n>crashImage}',
            Value: crash_image,
        },
    ],
);

annotate service.Characters with {
    id @Common.Label: '{i18n>characterId}';
    name @Common.Label: '{i18n>characterName}';
    idle_image @Common.Label: '{i18n>idleImage}';
    idle_image_mediaType @Common.Label: '{i18n>idleImageMediaType}';
    run_1_image @Common.Label: '{i18n>runImage1}';
    run_1_image_mediaType @Common.Label: '{i18n>runImage1MediaType}';
    run_2_image @Common.Label: '{i18n>runImage2}';
    run_2_image_mediaType @Common.Label: '{i18n>runImage2MediaType}';
    jump_image @Common.Label: '{i18n>jumpImage}';
    jump_image_mediaType @Common.Label: '{i18n>jumpImageMediaType}';
    crash_image @Common.Label: '{i18n>crashImage}';
    crash_image_mediaType @Common.Label: '{i18n>crashImageMediaType}';
};
