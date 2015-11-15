'use strict';

var controllers = angular.module('controllers', []);
var app = angular.module('app', ['controllers']);

controllers.controller('beerCtrl', function ($scope) {

    $scope.colours = [
      "#FFE699",
      "#FFE699",
      "#FFD878",
      "#FFCA5A",
      "#FFBF42",
      "#FBB123",
      "#F8A600",
      "#F39C00",
      "#EA8F00",
      "#E58500",
      "#DE7C00",
      "#D77200",
      "#CF6900",
      "#CB6200",
      "#C35900",
      "#BB5100",
      "#B54C00",
      "#B04500",
      "#A63E00",
      "#A13700",
      "#9B3200",
      "#952D00",
      "#8E2900",
      "#882300",
      "#821E00",
      "#7B1A00",
      "#771900",
      "#701400",
      "#6A0E00",
      "#660D00",
      "#5E0B00",
      "#5A0A02",
      "#560A05",
      "#520907",
      "#4C0505",
      "#470606",
      "#440607",
      "#3F0708",
      "#3B0607",
      "#3A070B",
      "#36080A"
    ];

    $scope.recipe = {
      grainPotential: 1.037,
      grainDiastatic: 0,
      mashEfficiency: 70,
      grainWeight: 5.24,
      sugarsExtracted: 0,
      mashVol: 14,
      mashThickness: 3,
      mashVolMultiplier: 0.652,
      mashVolRequired: 17,
      spargeVol: 12,
      grainAbsorption: 5,
      grainAbsorptionPercentage: 0.71, // 0.611,
      endOfRunningSG: "1.010",
      wortVol: 20,
      wortVolSG: 1.053,
      kettleTopUp: 0,
      volBefBoil: 0,
      evaporationRate: 8.2,
      boilTime: 60,
      boilOff: 0,
      volAfterBoil: 0,
      coolShrinkage: 0,
      intoFermenter: 0,
      intoFermenterSG: 1.058,
      bottlingLoss: 1,
      carbonationVol: 0.2,
      bottlingVol: 0,
      apparentAttenuation: 70,
      realAttenuation: 60,
      abv: 5.5,
      calories: 100,
      finalGravity: 1.017,
      remainingSugars: 0,
      grains: [
        {
          name: 'Pale Ale (2-row)',
          weight: 4.0,
          potential: 1.037,
          diastatic: 120,
          colour: 6
        },
        {
          name: 'Brown Malt',
          weight: 0.4,
          potential: 1.032,
          diastatic: 0,
          colour: 128.1
        },
        {
          name: 'CaraAmber',
          weight: 0.4,
          potential: 1.037,
          diastatic: 0,
          colour: 70.9
        },
        {
          name: 'Chocolate',
          weight: 0.4,
          potential: 1.034,
          diastatic: 0,
          colour: 886.5
        },
        {
          name: 'Roasted Barley',
          weight: 0.04,
          potential: 1.025,
          diastatic: 0,
          colour: 591
        }
      ],
      temp: {
        mashVol: 20,
        maxMashTemp: 75,
        spargeVol: 20,
        wortVol: 70,
        kettleTopUp: 95,
        volBefBoil: 100,
        volAfterBoil: 100,
        intoFermenter: 20,
        carbonationVol: 20,
        bottlingVol: 20
      }
    };

    function percentageToGravity(percent) { // at 16 C
      percent = percent * 100;
      return (2E-05) * percent * percent + 0.0038 * percent + 1.0008;
    }

    function gravityToPercent(gravity) { // at 16 C
      return (-135.35 * gravity * gravity + 516.2 * gravity - 380.52) / 100;
    }

    function potentialToSugarPerKg(potential) {
      var percent = gravityToPercent(potential);
      var kgPerPound = 3.78541 * percent;
      return kgPerPound / 0.4536;
    }

    function volumeChange(oldTemp, newTemp) {
      return (((0.000004) * newTemp * newTemp + (0.00009) * newTemp + 0.9979) / ((0.000004) * oldTemp * oldTemp + (0.00009) * oldTemp + 0.9979));
    }

    $scope.recalculateRecipe = function () {
      $scope.recipe.grainWeight = _.sum($scope.recipe.grains, 'weight');

      $scope.recipe.grainPotential = (_.sum($scope.recipe.grains, function (grain) {
        return grain.weight * grain.potential;
      }) / $scope.recipe.grainWeight).toFixed(3);

      $scope.recipe.grainDiastatic = (_.sum($scope.recipe.grains, function (grain) {
        return grain.weight * grain.diastatic;
      }) / $scope.recipe.grainWeight).toFixed(0);
      /*
       $scope.recipe.sugarsExtracted = (potentialToSugarPerKg($scope.recipe.grainPotential) * $scope.recipe.grainWeight
       * $scope.recipe.mashEfficiency / 100).toFixed(2);
       */
      $scope.recipe.totalSugars = (potentialToSugarPerKg($scope.recipe.grainPotential) * $scope.recipe.grainWeight).toFixed(2);

      $scope.recipe.mashVolRequired = ($scope.recipe.mashVol * volumeChange($scope.recipe.temp.mashVol, $scope.recipe.temp.maxMashTemp)
      + $scope.recipe.grainWeight * $scope.recipe.mashVolMultiplier * volumeChange(20, $scope.recipe.temp.maxMashTemp)).toFixed(2);

      $scope.recipe.mashThickness = ($scope.recipe.mashVol * volumeChange($scope.recipe.temp.mashVol, $scope.recipe.temp.maxMashTemp) / $scope.recipe.grainWeight).toFixed(2);

      $scope.recipe.grainAbsorption = ($scope.recipe.grainAbsorptionPercentage * $scope.recipe.grainWeight).toFixed(2);

      $scope.recipe.wortVol = ($scope.recipe.mashVol * volumeChange($scope.recipe.temp.mashVol, $scope.recipe.temp.wortVol)
      + $scope.recipe.spargeVol * volumeChange($scope.recipe.temp.spargeVol, $scope.recipe.temp.wortVol)
      - $scope.recipe.grainAbsorption * volumeChange(20, $scope.recipe.temp.wortVol)).toFixed(2);

//    var sugarsLost = gravityToPercent($scope.recipe.endOfRunningSG) * $scope.recipe.grainAbsorption;
      /*
       $scope.recipe.wortVolSG = percentageToGravity(($scope.recipe.sugarsExtracted - sugarsLost) /
       ($scope.recipe.wortVol * volumeChange($scope.recipe.temp.wortVol, 16))
       ).toFixed(3);
       */
      $scope.recipe.sugarsExtracted = (gravityToPercent($scope.recipe.wortVolSG) * $scope.recipe.wortVol * volumeChange($scope.recipe.temp.wortVol, 20)).toFixed(2);

      $scope.recipe.usedGrainWeight = ((parseFloat($scope.recipe.grainWeight) - parseFloat($scope.recipe.sugarsExtracted)) + parseFloat($scope.recipe.grainAbsorption)).toFixed(2);

      $scope.recipe.mashEfficiency = ($scope.recipe.sugarsExtracted / $scope.recipe.totalSugars * 100).toFixed(1);

      $scope.recipe.sugarsLeft = (gravityToPercent($scope.recipe.endOfRunningSG) * $scope.recipe.grainAbsorption).toFixed(2);

      $scope.recipe.sugarsUnextracted = (parseFloat($scope.recipe.totalSugars) - parseFloat($scope.recipe.sugarsExtracted) - parseFloat($scope.recipe.sugarsLeft)).toFixed(2);

      $scope.recipe.volBefBoil = (parseFloat($scope.recipe.wortVol) * volumeChange($scope.recipe.temp.wortVol, $scope.recipe.temp.volBefBoil)
      + parseFloat($scope.recipe.kettleTopUp) * volumeChange($scope.recipe.temp.kettleTopUp, $scope.recipe.temp.volBefBoil)).toFixed(2);

      $scope.recipe.evaporationRate = (((1 - gravityToPercent($scope.recipe.wortVolSG) / gravityToPercent($scope.recipe.intoFermenterSG)) * 100) / ($scope.recipe.boilTime / 60)).toFixed(1);

      $scope.recipe.boilOff = (1 - gravityToPercent($scope.recipe.wortVolSG) / gravityToPercent($scope.recipe.intoFermenterSG)) * $scope.recipe.volBefBoil;

      //  ($scope.recipe.volBefBoil * $scope.recipe.evaporationRate / 100 * $scope.recipe.boilTime / 60).toFixed(2);

      $scope.recipe.volAfterBoil = ((parseFloat($scope.recipe.volBefBoil) - parseFloat($scope.recipe.boilOff))
      * volumeChange($scope.recipe.temp.volBefBoil, $scope.recipe.temp.volAfterBoil)).toFixed(2);

      $scope.recipe.coolShrinkage = ($scope.recipe.volAfterBoil - $scope.recipe.volAfterBoil * volumeChange($scope.recipe.temp.volAfterBoil, $scope.recipe.temp.intoFermenter)).toFixed(2);

      $scope.recipe.intoFermenter = (parseFloat($scope.recipe.volAfterBoil) * volumeChange($scope.recipe.temp.volAfterBoil, $scope.recipe.temp.intoFermenter)).toFixed(2);
      /*
       $scope.recipe.intoFermenterSG = percentageToGravity($scope.recipe.sugarsExtracted / ($scope.recipe.intoFermenter * volumeChange($scope.recipe.temp.intoFermenter, 16))).toFixed(3);
       */

      $scope.recipe.bottlingVol = (parseFloat($scope.recipe.intoFermenter) * volumeChange($scope.recipe.temp.intoFermenter, $scope.recipe.temp.bottlingVol)
      - parseFloat($scope.recipe.bottlingLoss) * volumeChange($scope.recipe.temp.intoFermenter, $scope.recipe.temp.bottlingVol)
      + parseFloat($scope.recipe.carbonationVol) * volumeChange($scope.recipe.temp.carbonationVol, $scope.recipe.temp.bottlingVol)).toFixed(2);

      var colour = (((_.sum($scope.recipe.grains, function (grain) {
        return grain.weight * 2.20462 * grain.colour * 0.508;
      }) / ($scope.recipe.bottlingVol * 0.264172))));

      $scope.recipe.colour = (Math.pow(colour, 0.6859) * 1.4922 / 0.508).toFixed(1);

      $('#colour')
        .css("background-color", $scope.colours[Math.min(Math.round($scope.recipe.colour * 0.508), 40)])
        .css("color", $scope.recipe.colour > 20 ? "#FFFFFF" : "#000000");

      _.forEach($scope.recipe.grains, function (grain) {
        grain.weightPercentage = (grain.weight / $scope.recipe.grainWeight * 100).toFixed(1);
      });

      //$scope.recipe.finalGravity = (1 + ($scope.recipe.intoFermenterSG - 1) * (1 - $scope.recipe.apparentAttenuation / 100)).toFixed(3);

      var OG = parseFloat($scope.recipe.intoFermenterSG);
      var FG = parseFloat($scope.recipe.finalGravity);
      var OE = (-1 * 616.868) + (1111.14 * OG) - (630.272 * OG * OG) + (135.997 * OG * OG * OG);
      var AE = (-1 * 616.868) + (1111.14 * FG) - (630.272 * FG * FG) + (135.997 * FG * FG * FG);
      var RE = (0.8114 * AE) + (0.1886 * OE);
      var realFG = (1 + (RE / (258.6 - (RE / 258.2) * 227.1)));

      $scope.recipe.apparentAttenuation = ((1 - (FG - 1) / (OG - 1)) * 100).toFixed();
      $scope.recipe.realAttenuation = ((1 - (realFG - 1) / (OG - 1)) * 100).toFixed();
      $scope.recipe.remainingSugars = (($scope.recipe.sugarsExtracted * (100 - $scope.recipe.realAttenuation) / 100) /
      (parseFloat($scope.recipe.intoFermenter)) * 100).toFixed(1);

      var ABW = ((OE - RE) / (2.0665 - (0.010665 * OE)));
      $scope.recipe.abv = (ABW * (FG / 0.794)).toFixed(2);
      $scope.recipe.calories = ((3.8 * RE) + (7.1 * ABW) + (4.0 * 0.07 * RE)).toFixed(1);
    };

    $scope.recalculateRecipe();
  })
  .directive('numeric', function () {
    return {
      restrict: 'A',
      require: '?ngModel',
      scope: {
        model: '=ngModel'
      },
      link: function (scope, element, attrs, ngModelCtrl) {
        if (!ngModelCtrl) {
          return;
        }
        ngModelCtrl.$parsers.push(function (value) {
          if (!value || value === '' || isNaN(parseFloat(value))) {
            value = 0;
          }
          return parseFloat(value);
        });
      }
    };
  });
