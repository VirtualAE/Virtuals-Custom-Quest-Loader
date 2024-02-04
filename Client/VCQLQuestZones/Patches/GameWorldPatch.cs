using Aki.Reflection.Patching;
using EFT;
using System;
using System.Collections.Generic;
using System.Reflection;
using BepInEx;
using UnityEngine;
using VCQLQuestZones.Core;

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
                QuestZones.CreateZones(questZones, current_map);
            }
            catch (Exception e)
            {
                Logger.LogError(e);
            }
        }
    }
}
