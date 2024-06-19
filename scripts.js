// scripts.js
document.addEventListener('DOMContentLoaded', function () {
    var controller = new ScrollMagic.Controller();

    var introTween = gsap.fromTo(".intro h1", {opacity: 0}, {opacity: 1, duration: 2});
    new ScrollMagic.Scene({
        triggerElement: ".intro",
        triggerHook: 0.5,
        duration: "50%"
    })
    .setTween(introTween)
    .addTo(controller);

    var tempRiseTween = gsap.fromTo(".temperature-rise p, .temperature-rise .chart", {x: -200, opacity: 0}, {x: 0, opacity: 1, duration: 1.5});
    new ScrollMagic.Scene({
        triggerElement: ".temperature-rise",
        triggerHook: 0.5,
        duration: "50%"
    })
    .setTween(tempRiseTween)
    .addTo(controller);

    var glacialMeltTween = gsap.fromTo(".glacial-melt p, .glacial-melt .chart", {x: 200, opacity: 0}, {x: 0, opacity: 1, duration: 1.5});
    new ScrollMagic.Scene({
        triggerElement: ".glacial-melt",
        triggerHook: 0.5,
        duration: "50%"
    })
    .setTween(glacialMeltTween)
    .addTo(controller);

    var seaLevelRiseTween = gsap.fromTo(".sea-level-rise p, .sea-level-rise .chart", {scale: 0.5, opacity: 0}, {scale: 1, opacity: 1, duration: 1.5});
    new ScrollMagic.Scene({
        triggerElement: ".sea-level-rise",
        triggerHook: 0.5,
        duration: "50%"
    })
    .setTween(seaLevelRiseTween)
    .addTo(controller);

    var ecosystemImpactTween = gsap.fromTo(".ecosystem-impact p, .ecosystem-impact .chart", {y: 100, opacity: 0}, {y: 0, opacity: 1, duration: 1.5});
    new ScrollMagic.Scene({
        triggerElement: ".ecosystem-impact",
        triggerHook: 0.5,
        duration: "50%"
    })
    .setTween(ecosystemImpactTween)
    .addTo(controller);
});
