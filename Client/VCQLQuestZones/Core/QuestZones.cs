using EFT.UI;
using System.Collections.Generic;
using UnityEngine;
using Comfort.Common;
using EFT;

namespace VCQLQuestZones.Core
{
    internal class QuestZones
    {
        public static List<Zone> GetZones()
        {
            var request = Utils.Get<List<Zone>>("/vcql/zones/get");
#if DEBUG
            int loadedZoneCount = 0;
            foreach (var zone in request)
            {
                if (zone.ZoneLocation.ToLower() == Singleton<GameWorld>.Instance.MainPlayer.Location.ToLower())
                {
                    ConsoleScreen.Log("-------------------------------------");
                    ConsoleScreen.Log($"Scale Z: {zone.Scale.Z}");
                    ConsoleScreen.Log($"Scale Y: {zone.Scale.Y}");
                    ConsoleScreen.Log($"Scale X: {zone.Scale.X}");
                    ConsoleScreen.Log($"ZoneScale:");
                    ConsoleScreen.Log($"Position Z: {zone.Position.Z}");
                    ConsoleScreen.Log($"Position Y: {zone.Position.Y}");
                    ConsoleScreen.Log($"Position X: {zone.Position.X}");
                    ConsoleScreen.Log("ZonePosition:");
                    ConsoleScreen.Log($"ZoneType: {zone.ZoneType}");
                    ConsoleScreen.Log($"ZoneLocation: {zone.ZoneLocation}");
                    ConsoleScreen.Log($"ZoneId: {zone.ZoneId}");
                    ConsoleScreen.Log($"ZoneName: {zone.ZoneName}");
                    ConsoleScreen.Log("-------------------------------------");
                    loadedZoneCount++;
                }
            }
            ConsoleScreen.Log("-------------------------------------");
            ConsoleScreen.Log($"Loaded Zone Count: {loadedZoneCount}");
            ConsoleScreen.Log($"Player Map Location: {Singleton<GameWorld>.Instance.MainPlayer.Location}");
#endif   
            return request;
        }

        public static GameObject ZoneCreateItem(Zone zone)
        {
            GameObject newZone = new GameObject();

            BoxCollider boxCollider = newZone.AddComponent<BoxCollider>();
            boxCollider.isTrigger = true;

            Vector3 position = new Vector3(float.Parse(zone.Position.X), float.Parse(zone.Position.Y), float.Parse(zone.Position.Z));
            Vector3 scale = new Vector3(float.Parse(zone.Scale.X), float.Parse(zone.Scale.Y), float.Parse(zone.Scale.Z));

            newZone.transform.position = position;
            newZone.transform.localScale = scale;

            EFT.Interactive.PlaceItemTrigger trigger = newZone.AddComponent<EFT.Interactive.PlaceItemTrigger>();
            trigger.SetId(zone.ZoneId);

            newZone.layer = LayerMask.NameToLayer("Triggers");
            newZone.name = zone.ZoneId;

            return newZone;
        }

        public static GameObject ZoneCreateVisit(Zone zone)
        {
            GameObject newZone = new GameObject();

            BoxCollider boxCollider = newZone.AddComponent<BoxCollider>();
            boxCollider.isTrigger = true;

            Vector3 position = new Vector3(float.Parse(zone.Position.X), float.Parse(zone.Position.Y), float.Parse(zone.Position.Z));
            Vector3 scale = new Vector3(float.Parse(zone.Scale.X), float.Parse(zone.Scale.Y), float.Parse(zone.Scale.Z));

            newZone.transform.position = position;
            newZone.transform.localScale = scale;

            EFT.Interactive.ExperienceTrigger trigger = newZone.AddComponent<EFT.Interactive.ExperienceTrigger>();
            trigger.SetId(zone.ZoneId);

            newZone.layer = LayerMask.NameToLayer("Triggers");
            newZone.name = zone.ZoneId;

            return newZone;
        }

        public static GameObject ZoneCreateBotKillZone(Zone zone)
        {
            GameObject newZone = new GameObject();

            BoxCollider boxCollider = newZone.AddComponent<BoxCollider>();
            boxCollider.isTrigger = true;

            Vector3 position = new Vector3(float.Parse(zone.Position.X), float.Parse(zone.Position.Y), float.Parse(zone.Position.Z));
            Vector3 scale = new Vector3(float.Parse(zone.Scale.X), float.Parse(zone.Scale.Y), float.Parse(zone.Scale.Z));

            newZone.transform.position = position;
            newZone.transform.localScale = scale;

            EFT.Interactive.TriggerWithId trigger = newZone.AddComponent<EFT.Interactive.TriggerWithId>();
            trigger.SetId(zone.ZoneId);

            newZone.layer = LayerMask.NameToLayer("Triggers");
            newZone.name = zone.ZoneId;

            return newZone;
        }

        public static void CreateZones(List<Zone> zones, string Location)
        {
            foreach (Zone zone in zones)
            {
                if (zone.ZoneLocation.ToLower() == Location.ToLower())
                {
                    if (zone.ZoneType.ToLower() == "placeitem")
                    {
                        ZoneCreateItem(zone);
                    }

                    if (zone.ZoneType.ToLower() == "visit")
                    {
                        ZoneCreateVisit(zone);
                    }

                    if (zone.ZoneType.ToLower() == "flarezone")
                    {
                        //GameObject flareZone = ZoneCreateFlare(zone);
                    }

                    if (zone.ZoneType.ToLower() == "botkillzone")
                    {
                        ZoneCreateBotKillZone(zone);
                    }
                }
            }
        }
    }
}
