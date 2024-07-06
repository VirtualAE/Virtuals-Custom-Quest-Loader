using SPT.Reflection.Patching;
using EFT;
using System;
using System.Collections.Generic;
using System.Reflection;
using BepInEx;
using UnityEngine;
using VCQLQuestZones.Core;
using System.Linq;

namespace VCQLQuestZones.Patches
{
    internal class GameWorldPatch: ModulePatch
    {
        protected override MethodBase GetTargetMethod()
        {
            return typeof(GameWorld).GetMethod("OnGameStarted", BindingFlags.Public | BindingFlags.Instance);
        }

        [PatchPostfix]
        private static void PatchPostfix(GameWorld __instance)
        {
            try
            {
                string current_map = __instance.MainPlayer.Location;
                List<Zone> questZones = QuestZones.GetZones();
                List<Zone> validZones = questZones.Where(zone => zone.ZoneLocation.ToLower() == current_map.ToLower()).ToList();
                Plugin.ExistingQuestZones = validZones;
                QuestZones.CreateZones(validZones);
            }
            catch (Exception e)
            {
                Logger.LogError(e);
            }
        }
    }
}
